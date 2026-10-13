import { Signal, signal } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { EMPTY, Observable, Subject, Subscription, combineLatest, defer, from, isObservable, of } from 'rxjs';
import { catchError, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import {
    IKlesFormFieldsResolver,
    KlesFormFieldsContainer,
    KlesFormElement,
    isKlesFieldsContainer,
    isKlesStructuralElement,
} from '../interfaces/layout.interface';

export type KlesResolvableFormElement = KlesFormFieldsContainer;

export interface IKlesFieldDependencyDiagnostic {
    readonly code: 'invalid-path' | 'missing-control' | 'cycle' | 'blocked-dependency' | 'resolver-error' | 'invalid-result';
    readonly message: string;
    readonly element: KlesResolvableFormElement;
    readonly paths: readonly string[];
    readonly error?: unknown;
}

export interface IKlesFieldResolutionState {
    readonly status: 'waiting' | 'loading' | 'ready' | 'error';
    /** Last successful result, or static fields before the first result. */
    readonly fields: readonly KlesFormElement[];
    readonly diagnostic?: IKlesFieldDependencyDiagnostic;
}

export interface IKlesFieldsResolvedEvent {
    readonly element: KlesResolvableFormElement;
    readonly fields: readonly KlesFormElement[];
}

export interface IKlesFormDependencyEngineOptions {
    /** Effective children committed by a renderer; declarative fields are the default. */
    readonly getChildren?: (element: KlesResolvableFormElement) => readonly KlesFormElement[];
    /** Validate and synchronize a result before it is published as successful. */
    readonly applyResult?: (event: IKlesFieldsResolvedEvent) => void;
}

interface DependencyNode {
    element: KlesResolvableFormElement;
    resolver: IKlesFormFieldsResolver;
    paths: string[];
    invalidPaths: boolean;
    ancestors: Set<KlesFormElement>;
    controls: AbstractControl[];
    subscription: Subscription;
    active: boolean;
    version: number;
    state: IKlesFieldResolutionState;
    /** Includes a rejected cyclic result so the same invalid branch cannot loop. */
    producedFields?: readonly KlesFormElement[];
    diagnosticKey?: string;
}

class InvalidFieldsResult extends Error {}

/**
 * Observes root-relative dependencies and resolves container children.
 * Results are emitted and retained as state; this engine never mutates the
 * element tree or Angular controls. Call update after silent structural edits.
 */
export class KlesFormDependencyEngine {
    private readonly stateStore = signal<ReadonlyMap<KlesResolvableFormElement, IKlesFieldResolutionState>>(new Map());
    readonly states: Signal<ReadonlyMap<KlesResolvableFormElement, IKlesFieldResolutionState>> = this.stateStore.asReadonly();
    private readonly results = new Subject<IKlesFieldsResolvedEvent>();
    readonly resolved$: Observable<IKlesFieldsResolvedEvent> = this.results.asObservable();
    private readonly diagnosticEvents = new Subject<IKlesFieldDependencyDiagnostic>();
    readonly diagnostics$: Observable<IKlesFieldDependencyDiagnostic> = this.diagnosticEvents.asObservable();
    private readonly nodes = new Map<KlesResolvableFormElement, DependencyNode>();
    private readonly formSubscription: Subscription;
    private elements: readonly KlesFormElement[] = [];
    private destroyed = false;
    private updating = false;
    private updateRequested = false;

    constructor(
        private readonly group: UntypedFormGroup,
        private readonly getContext: () => unknown | null = () => null,
        private readonly options: IKlesFormDependencyEngineOptions = {},
    ) {
        // Value events also reveal added, removed or replaced controls. A silent
        // edit needs an explicit update; do not intercept Angular's private hooks.
        this.formSubscription = group.valueChanges.subscribe(() => {
            if (this.nodes.size) this.update(this.elements);
        });
    }

    update(elements: readonly KlesFormElement[]): void {
        if (this.destroyed) return;
        this.elements = elements;
        if (this.updating) {
            this.updateRequested = true;
            return;
        }
        this.updating = true;
        try {
            do {
                this.updateRequested = false;
                this.synchronizeNodes();
                const blocked = this.findBlockedNodes();
                for (const node of this.nodes.values()) this.bind(node, blocked);
            } while (this.updateRequested && !this.destroyed);
        } finally {
            this.updating = false;
        }
    }

    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.formSubscription.unsubscribe();
        for (const node of this.nodes.values()) this.stop(node);
        this.nodes.clear();
        this.stateStore.set(new Map());
        this.results.complete();
        this.diagnosticEvents.complete();
    }

    private synchronizeNodes(): void {
        const containers = new Map<KlesResolvableFormElement, Set<KlesFormElement>>();
        const visit = (elements: readonly KlesFormElement[], visited: Set<KlesFormElement>, ancestors: Set<KlesFormElement>) => {
            for (const element of elements) {
                if (visited.has(element)) continue;
                visited.add(element);
                if (isKlesFieldsContainer(element)) {
                    const branch = new Set(ancestors).add(element);
                    if (element.resolveFields) containers.set(element, branch);
                    visit(this.childrenOf(element), visited, branch);
                }
            }
        };
        visit(this.elements, new Set(), new Set());
        for (const [element, node] of this.nodes) {
            if (!containers.has(element)) {
                this.stop(node);
                this.nodes.delete(element);
                const states = new Map(this.stateStore());
                states.delete(element);
                this.stateStore.set(states);
            }
        }
        for (const [element, ancestors] of containers) {
            const declared = element.dependsOn ?? [];
            const invalidPaths = !Array.isArray(declared) || declared.some((path) =>
                typeof path !== 'string' || !/^[^.*/\[\]\s]+(?:\.[^.*/\[\]\s]+)*$/u.test(path),
            );
            const paths = Array.isArray(declared) ? [...new Set(declared.filter((path): path is string => typeof path === 'string'))] : [];
            const previous = this.nodes.get(element);
            if (previous && previous.resolver === element.resolveFields
                && previous.invalidPaths === invalidPaths && this.sameValues(previous.paths, paths)) {
                previous.ancestors = ancestors;
                continue;
            }
            if (previous) this.stop(previous);
            const node: DependencyNode = {
                element, resolver: element.resolveFields!, paths, invalidPaths, ancestors,
                controls: [], subscription: new Subscription(), active: false, version: 0,
                state: { status: 'waiting', fields: previous?.state.fields ?? this.childrenOf(element) },
            };
            this.nodes.set(element, node);
            this.setState(node, node.state);
        }
    }

    private bind(node: DependencyNode, blocked: Map<DependencyNode, 'cycle' | 'blocked-dependency'>): void {
        if (node.invalidPaths) {
            this.stop(node);
            this.report(node, 'invalid-path', 'Dependency paths must be non-empty root-relative paths without wildcards or whitespace.');
            return;
        }
        const block = blocked.get(node);
        if (block) {
            this.stop(node);
            this.report(node, block, block === 'cycle' ? 'Cyclic field dependencies.' : 'A dependency belongs to a cyclic container.');
            return;
        }
        const controls = node.paths.map((path) => this.group.get(path));
        const missing = node.paths.filter((_, index) => !controls[index]);
        if (missing.length) {
            this.stop(node);
            this.report(node, 'missing-control', `Waiting for controls: ${missing.join(', ')}.`, undefined, 'waiting');
            return;
        }
        const readyControls = controls as AbstractControl[];
        if (node.active && this.sameValues(node.controls, readyControls)) return;
        this.stop(node);
        node.controls = readyControls;
        node.active = true;
        const version = node.version;
        const subscription = new Subscription();
        node.subscription = subscription;
        const values = readyControls.length
            ? combineLatest(readyControls.map((control) => control.valueChanges.pipe(startWith(control.value))))
            : of([] as unknown[]);
        subscription.add(values.pipe(
            distinctUntilChanged((previous, next) => this.sameValues(previous, next)),
            switchMap(() => defer(() => {
                this.setState(node, { status: 'loading', fields: node.state.fields });
                node.diagnosticKey = undefined;
                const result = node.resolver({
                    element: node.element, group: this.group,
                    values: this.group.getRawValue(), context: this.getContext(),
                });
                if (Array.isArray(result)) return of(result as readonly KlesFormElement[]);
                if (isObservable(result)) return result;
                if (result && typeof (result as Promise<readonly KlesFormElement[]>).then === 'function') {
                    return from(result as Promise<readonly KlesFormElement[]>);
                }
                throw new InvalidFieldsResult('resolveFields must return an array, a Promise, or an Observable of field arrays.');
            }).pipe(
                tap({
                    next: (fields) => this.accept(node, version, fields),
                    complete: () => {
                        if (this.isCurrent(node, version) && node.state.status === 'loading') {
                            this.setState(node, { status: 'ready', fields: node.state.fields });
                        }
                    },
                }),
                catchError((error: unknown) => {
                    if (this.isCurrent(node, version)) {
                        this.report(node, error instanceof InvalidFieldsResult ? 'invalid-result' : 'resolver-error',
                            error instanceof Error ? error.message : 'Field resolution failed.', error);
                    }
                    // Keep observing the dependencies so the next change can retry.
                    return EMPTY;
                }),
            )),
        ).subscribe());
    }

    private accept(node: DependencyNode, version: number, fields: readonly KlesFormElement[]): void {
        if (!this.isCurrent(node, version)) return;
        if (!this.validFields(fields, node.ancestors)) {
            throw new InvalidFieldsResult('Each resolution must produce an array of field configurations.');
        }
        const previousFields = node.producedFields;
        node.producedFields = fields;
        const blocked = this.findBlockedNodes();
        for (const [affected, reason] of blocked) {
            this.stop(affected);
            this.report(affected, reason, reason === 'cycle' ? 'Cyclic field dependencies.' : 'A dependency belongs to a cyclic container.');
        }
        if (!this.isCurrent(node, version)) return;
        try {
            this.options.applyResult?.({ element: node.element, fields });
        } catch (error) {
            node.producedFields = previousFields;
            throw new InvalidFieldsResult(error instanceof Error ? error.message : 'The resolved fields could not be synchronized.');
        }
        if (!this.isCurrent(node, version)) return;
        this.setState(node, { status: 'ready', fields });
        node.diagnosticKey = undefined;
        this.results.next({ element: node.element, fields });
    }

    private validFields(fields: readonly KlesFormElement[], ancestors = new Set<KlesFormElement>()): boolean {
        return Array.isArray(fields) && fields.every((field) => {
            if (!field || typeof field !== 'object' || ancestors.has(field)) return false;
            if (isKlesStructuralElement(field)) {
                if (isKlesFieldsContainer(field)) {
                    return (field.type !== 'section' || typeof field.title === 'string')
                        && this.validFields(field.fields, new Set(ancestors).add(field));
                }
                return true;
            }
            return typeof field.name === 'string';
        });
    }

    private findBlockedNodes(): Map<DependencyNode, 'cycle' | 'blocked-dependency'> {
        const owners = new Map<string, Set<DependencyNode>>();
        const visit = (elements: readonly KlesFormElement[], ancestors: DependencyNode[], visited: Set<KlesFormElement>) => {
            for (const element of elements) {
                if (visited.has(element)) continue;
                const branch = new Set(visited).add(element);
                if (isKlesStructuralElement(element)) {
                    if (isKlesFieldsContainer(element)) {
                        const node = this.nodes.get(element);
                        visit(node?.producedFields ?? this.childrenOf(element), node ? [...ancestors, node] : ancestors, branch);
                    }
                } else {
                    const fieldOwners = owners.get(element.name) ?? new Set<DependencyNode>();
                    ancestors.forEach((owner) => fieldOwners.add(owner));
                    owners.set(element.name, fieldOwners);
                }
            }
        };
        visit(this.elements, [], new Set());
        const graph = new Map<DependencyNode, Set<DependencyNode>>();
        for (const node of this.nodes.values()) {
            const dependencies = new Set<DependencyNode>();
            for (const path of node.paths) {
                for (const [name, fieldOwners] of owners) {
                    if (path === name || path.startsWith(`${name}.`)) fieldOwners.forEach((owner) => dependencies.add(owner));
                }
            }
            graph.set(node, dependencies);
        }
        const blocked = new Map<DependencyNode, 'cycle' | 'blocked-dependency'>();
        for (const origin of graph.keys()) {
            const reachesOrigin = (node: DependencyNode, visited: Set<DependencyNode>): boolean => {
                if (visited.has(node)) return false;
                visited.add(node);
                for (const dependency of graph.get(node) ?? []) {
                    if (dependency === origin || reachesOrigin(dependency, visited)) return true;
                }
                return false;
            };
            if (reachesOrigin(origin, new Set())) blocked.set(origin, 'cycle');
        }
        let changed: boolean;
        do {
            changed = false;
            for (const [node, dependencies] of graph) {
                if (!blocked.has(node) && [...dependencies].some((dependency) => blocked.has(dependency))) {
                    blocked.set(node, 'blocked-dependency');
                    changed = true;
                }
            }
        } while (changed);
        return blocked;
    }

    private sameValues(previous: readonly unknown[], next: readonly unknown[]): boolean {
        return previous.length === next.length && previous.every((value, index) => Object.is(value, next[index]));
    }

    private childrenOf(element: KlesResolvableFormElement): readonly KlesFormElement[] {
        return this.options.getChildren?.(element) ?? element.fields;
    }

    private isCurrent(node: DependencyNode, version: number): boolean {
        return !this.destroyed && node.active && node.version === version && this.nodes.get(node.element) === node;
    }

    private stop(node: DependencyNode): void {
        node.active = false;
        node.version++;
        node.subscription.unsubscribe();
        node.controls = [];
    }

    private setState(node: DependencyNode, state: IKlesFieldResolutionState): void {
        node.state = state;
        this.stateStore.set(new Map(this.stateStore()).set(node.element, state));
    }

    private report(
        node: DependencyNode,
        code: IKlesFieldDependencyDiagnostic['code'],
        message: string,
        error?: unknown,
        status: IKlesFieldResolutionState['status'] = 'error',
    ): void {
        const key = `${code}:${message}`;
        if (node.diagnosticKey === key) return;
        node.diagnosticKey = key;
        const diagnostic: IKlesFieldDependencyDiagnostic = { code, message, element: node.element, paths: node.paths, error };
        this.setState(node, { status, fields: node.state.fields, diagnostic });
        this.diagnosticEvents.next(diagnostic);
        console.warn(`[KlesDynamicForm] ${message}`, diagnostic);
    }
}
