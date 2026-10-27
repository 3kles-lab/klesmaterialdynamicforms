import { OnInit, OnDestroy, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, Signal, ViewChild, computed, signal, isDevMode, inject, input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ValidatorFn, AsyncValidatorFn, AbstractControl, FormArray, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { componentMapper } from './decorators/component.decorator';
import { EnumType } from './enums/type.enum';
import { klesFieldControlFactory, klesFieldUiFactory } from './factories/field.factory';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { IKlesValidator } from './interfaces/validator.interface';
import { CommonModule } from '@angular/common';

import { MatError } from '@angular/material/form-field';
import { KlesDynamicFieldDirective } from './directive/dynamic-field.directive';
import { MatErrorFormDirective } from './directive/mat-error-form.directive';
import { ErrorStateMatcher } from '@angular/material/core';
import { KlesFormErrorStateMatcher } from './matcher/form-error.matcher';
import { AbstractUiState } from './ui/ui-state/ui-state.abstract';
import { GroupUiState } from './ui/ui-state/group-ui-state';
import { ControlUiState } from './ui/ui-state/control-ui-state';
import { KlesFormControl } from './controls/default.control';
import { KlesFormElementsComponent } from './form-elements.component';
import { IKlesLayoutConfig, KlesFormElement, expandKlesDynamicFields, flattenKlesFields, isKlesFieldsContainer, isKlesStructuralElement } from './interfaces/layout.interface';
import { IKlesFieldResolutionState, IKlesFieldsResolvedEvent, KlesFormDependencyEngine, KlesResolvableFormElement } from './dependencies/field-dependency-engine';
import { FORM_SUBMITTING } from './token';

const DEFAULT_GRID_GAP = '0';

interface SynchronizedField {
    config: IKlesFieldConfig;
    control: AbstractControl | null;
    component: unknown;
    factory: unknown;
    uiFactory: unknown;
    validators: ValidatorFn[];
    asyncValidators: AsyncValidatorFn[];
    uiDefaults: Record<string, unknown>;
}

@Component({
    exportAs: 'klesDynamicForm',
    selector: 'app-kles-dynamic-form',
    standalone: true,
    template: `
        <form class="{{ orientationClass }}" [class.dynamic-form-nowrap]="orientationClass === 'dynamic-form-row' && wrap === false" [ngClass]="formClass" [ngStyle]="gridStyles" [formGroup]="form" [attr.aria-busy]="submitting() ? 'true' : null" (submit)="onSubmit($event)">
            @if (usesAdvancedLayout) {
                <kles-form-elements [elements]="renderedRootElements" [group]="form" [ui]="ui" [context]="context" [layoutConfig]="layout" />
            } @else {
                @for (field of legacyFields; track field.name) {
                    @if (field.visible !== false) {
                        <ng-container klesDynamicField [field]="field" [group]="form" [control]="form.controls[field.name]" [ui]="ui" [fieldState]="ui.get([field.name])" [siblingFields]="legacyFields" [context]="context"> </ng-container>
                    }
                }
            }
            @if (form && form.errors) {
                <mat-error matErrorForm [form]="form" [validations]="validators" [asyncValidations]="asyncValidators"></mat-error>
            }
        </form>
    `,
    styles: [
        '.dynamic-form-column { display: flex;flex-direction: column; }',
        '.dynamic-form-column > * { width: 100%; }',
        '.dynamic-form-row { display: inline-flex; flex-wrap:wrap; gap:10px; align-items: baseline}',
        '.dynamic-form-row.dynamic-form-nowrap { flex-wrap: nowrap; }',
        '.dynamic-form-row > * { width: 100%; }',
        '.dynamic-form-grid { display: grid; grid-template-columns: repeat(var(--kles-grid-columns, 12), minmax(0, 1fr)); gap: var(--kles-grid-gap, 0); }',
        '.dynamic-form-inline-grid { display: inline-grid; grid-template-columns: repeat(var(--kles-grid-columns, 12), minmax(0, 1fr)); gap: var(--kles-grid-gap, 0); }',
    ],
    providers: [
        { provide: ErrorStateMatcher, useClass: KlesFormErrorStateMatcher },
        { provide: FORM_SUBMITTING, useFactory: () => inject(KlesDynamicFormComponent).submitting },
    ],
    imports: [CommonModule, MatErrorFormDirective, KlesDynamicFieldDirective, KlesFormElementsComponent, FormsModule, ReactiveFormsModule, MatError],
})
export class KlesDynamicFormComponent implements OnInit, OnChanges, OnDestroy {
    /** Controlled by the parent for the entire save operation, including error handling. */
    readonly submitting = input(false);
    @ViewChild(KlesFormElementsComponent) private formElements?: KlesFormElementsComponent;
    @Input() context: Signal<unknown | null> | null = null;
    @Input() fields: KlesFormElement[] = [];
    @Input() validators: IKlesValidator<ValidatorFn>[] = [];
    @Input() asyncValidators: IKlesValidator<AsyncValidatorFn>[] = [];
    // tslint:disable-next-line: no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onLoaded = new EventEmitter();

    @Input() direction: 'column' | 'row' | 'grid' | 'inline-grid' = 'column';
    @Input() wrap = true;
    /** Configuration of the advanced grid container. */
    @Input() layout: IKlesLayoutConfig = {};
    @Input() formClass: string | string[] | Set<string> | { [klass: string]: any } = '';

    form!: UntypedFormGroup;
    ui!: GroupUiState;
    /** Effective tree used by the renderer; the supplied configuration is never mutated. */
    renderedFields: KlesFormElement[] = [];
    /** Elements at the root visual level, with transparent slots expanded. */
    renderedRootElements: KlesFormElement[] = [];
    private flattenedSource: KlesFormElement[] | null = null;
    private flattenedFields: IKlesFieldConfig[] = [];
    private readonly layoutWarnings = new Set<string>();
    private synchronizedFields = new Map<string, SynchronizedField>();
    private readonly dependencyEngine = signal<KlesFormDependencyEngine | null>(null);
    private readonly emptyResolutions: ReadonlyMap<KlesResolvableFormElement, IKlesFieldResolutionState> = new Map();
    private resolvedChildren = new Map<KlesResolvableFormElement, readonly KlesFormElement[]>();
    private readonly pendingResults = new Map<KlesResolvableFormElement, readonly KlesFormElement[]>();
    private readonly renderedContainers = new WeakMap<KlesResolvableFormElement, KlesResolvableFormElement>();
    private synchronizing = false;
    /** Results and diagnostics for automatically synchronized container children. */
    readonly fieldResolutions = computed(() => this.dependencyEngine()?.states() ?? this.emptyResolutions);
    get orientationClass(): 'dynamic-form-column' | 'dynamic-form-row' | 'dynamic-form-grid' | 'dynamic-form-inline-grid' {
        if (this.hasRootElementLayout && this.direction !== 'inline-grid') return 'dynamic-form-grid';
        return `dynamic-form-${this.direction}`;
    }

    get value() {
        return this.form.value;
    }

    /** Open every collapsible section, including nested sections. Call after the view is initialized. */
    expandAllSections(): void {
        this.formElements?.expandAllSections();
    }

    /** Close every collapsible section, including nested sections. Call after the view is initialized. */
    collapseAllSections(): void {
        this.formElements?.collapseAllSections();
    }

    get legacyFields(): IKlesFieldConfig[] {
        if (this.flattenedSource !== this.renderedFields) {
            this.flattenedSource = this.renderedFields;
            this.flattenedFields = flattenKlesFields(this.renderedFields);
        }
        return this.flattenedFields;
    }

    get usesAdvancedLayout(): boolean {
        return this.direction === 'grid' || this.direction === 'inline-grid' || this.hasRootElementLayout || this.renderedRootElements.some(isKlesStructuralElement);
    }

    get gridStyles(): Record<string, string | number> | null {
        if (this.orientationClass !== 'dynamic-form-grid' && this.orientationClass !== 'dynamic-form-inline-grid') return null;
        return {
            '--kles-grid-columns': this.normalizeColumns(this.layout.columns),
            '--kles-grid-gap': this.layout.gap?.trim() || DEFAULT_GRID_GAP,
        };
    }

    private get hasRootElementLayout(): boolean {
        return this.renderedRootElements.some((element) => element.layout != null);
    }

    constructor(
        private fb: UntypedFormBuilder,
        private ref: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.form = this.fb.group({});
        this.ui = new GroupUiState();
        this.form.setValidators(this.validators.map((v) => v.validator));
        this.form.setAsyncValidators(this.asyncValidators.map((v) => v.validator));
        const engine = new KlesFormDependencyEngine(this.form, () => this.context?.() ?? null, {
            getChildren: (element) => this.childrenOf(element),
            applyResult: (event) => this.applyResolvedFields(event),
        });
        this.dependencyEngine.set(engine);
        this.synchronizeFields();
        this._onLoaded.emit();
    }

    ngOnDestroy(): void {
        this.dependencyEngine()?.destroy();
        this.pendingResults.clear();
        this.resolvedChildren.clear();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.validators && !changes.validators.firstChange && this.form) {
            this.form.setValidators(this.validators.map((v) => v.validator));
        }

        if (changes.asyncValidators && !changes.asyncValidators.firstChange && this.form) {
            this.form.setAsyncValidators(this.asyncValidators.map((v) => v.validator));
        }

        if (changes.fields && !changes.fields.firstChange && this.form) {
            this.synchronizeFields(true, !!(changes.validators || changes.asyncValidators));
            this._onLoaded.emit();
        } else if (this.form && (changes.validators || changes.asyncValidators)) {
            this.form.updateValueAndValidity();
        }
    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.submitting()) return;
        if (this.form.valid) {
            this.submit.emit(this.form.getRawValue());
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    private applyResolvedFields({ element, fields }: IKlesFieldsResolvedEvent): void {
        const candidate = new Map(this.resolvedChildren);
        for (const [container, children] of this.pendingResults) candidate.set(container, children);
        candidate.set(element, fields);
        // Validate the complete effective tree before removing any current controls.
        this.validateFields(candidate);
        if (this.synchronizing) {
            this.pendingResults.set(element, fields);
            return;
        }
        this.resolvedChildren = candidate;
        this.synchronizeFields(true);
        this.ref.markForCheck();
        this._onLoaded.emit();
    }

    private synchronizeFields(emitEvent = false, validatorsChanged = false): void {
        this.synchronizing = true;
        let controlsChanged = validatorsChanged;
        try {
            do {
                for (const [element, fields] of this.pendingResults) this.resolvedChildren.set(element, fields);
                this.pendingResults.clear();
                const active = this.validateFields(this.resolvedChildren);
                for (const element of this.resolvedChildren.keys()) {
                    if (!active.has(element)) this.resolvedChildren.delete(element);
                }
                this.renderedFields = this.renderElements(this.fields);
                this.renderedRootElements = expandKlesDynamicFields(this.renderedFields);
                const changed = this.updateForm();
                controlsChanged ||= changed;
                if (changed || validatorsChanged || !this.legacyFields.length) this.form.updateValueAndValidity({ emitEvent: false });
                validatorsChanged = false;
                // May produce synchronous results or register newly generated containers.
                // Queue these results and finish the current synchronization first.
                this.dependencyEngine()?.update(this.fields);
            } while (this.pendingResults.size);
            if (controlsChanged) this.form.updateValueAndValidity({ emitEvent });
        } finally {
            this.synchronizing = false;
        }
    }

    private childrenOf(
        element: KlesResolvableFormElement,
        overrides = this.resolvedChildren,
    ): readonly KlesFormElement[] {
        return element.resolveFields ? overrides.get(element) ?? element.fields : element.fields;
    }

    private validateFields(overrides: Map<KlesResolvableFormElement, readonly KlesFormElement[]>): Set<KlesResolvableFormElement> {
        const names = new Set<string>();
        const active = new Set<KlesResolvableFormElement>();
        const visit = (elements: readonly KlesFormElement[], ancestors: Set<KlesFormElement>) => {
            for (const element of elements) {
                if (ancestors.has(element)) throw new Error('[KlesDynamicForm] Recursive visual container.');
                if (isKlesStructuralElement(element)) {
                    if (isKlesFieldsContainer(element)) {
                        if (element.resolveFields) active.add(element);
                        visit(this.childrenOf(element, overrides), new Set(ancestors).add(element));
                    }
                } else {
                    if (names.has(element.name)) throw new Error(`[KlesDynamicForm] Duplicate field name '${element.name}' in the root form.`);
                    names.add(element.name);
                }
            }
        };
        visit(this.fields, new Set());
        return active;
    }

    private renderElements(elements: readonly KlesFormElement[]): KlesFormElement[] {
        return elements.map((element) => {
            if (!isKlesFieldsContainer(element)) return element;
            let rendered = this.renderedContainers.get(element);
            if (!rendered) {
                rendered = { ...element };
                this.renderedContainers.set(element, rendered);
            }
            // Stable wrapper identities retain panels and unaffected child views.
            for (const key of Object.keys(rendered)) {
                if (!Object.prototype.hasOwnProperty.call(element, key)) delete (rendered as unknown as Record<string, unknown>)[key];
            }
            Object.assign(rendered, element, { fields: this.renderElements(this.childrenOf(element)) });
            return rendered;
        });
    }

    private updateForm(): boolean {
        const fields = this.legacyFields;
        const names = new Set(fields.map((field) => field.name));

        let controlsChanged = false;
        for (const name of Object.keys(this.form.controls)) {
            if (!names.has(name)) {
                const removed = this.form.controls[name];
                this.form.removeControl(name, { emitEvent: false });
                removed.setParent(null);
                controlsChanged = true;
            }
        }
        for (const name of Object.keys(this.ui.states)) {
            if (!names.has(name)) this.ui.removeUiState(name);
        }

        const next = new Map<string, SynchronizedField>();
        for (const field of fields) {
            const previous = this.synchronizedFields.get(field.name);
            const mapping = this.findMapping(field);
            const component = mapping?.component ?? field.component;
            const factory = mapping?.factory ?? klesFieldControlFactory;
            const uiFactory = mapping?.ui ?? klesFieldUiFactory;
            let control: AbstractControl | null = this.form.controls[field.name] ?? null;
            const compatible = !!previous
                && previous.control === control
                && previous.component === component
                && previous.factory === factory
                && (previous.config.updateOn ?? 'change') === (field.updateOn ?? 'change')
                && !!previous.config.nonNullable === !!field.nonNullable;
            const validators = (field.validations ?? []).map((v) => v.validator);
            const asyncValidators = (field.asyncValidations ?? []).map((v) => v.validator);

            if (!compatible) {
                const replaced = control;
                control = this.createControl(field);
                if (control) {
                    if (this.form.controls[field.name]) {
                        this.form.setControl(field.name, control, { emitEvent: false });
                    } else {
                        // The new view registers its own binding. Avoid revalidating
                        // every mounted control through FormGroup's collection hook.
                        this.form.registerControl(field.name, control);
                    }
                } else if (this.form.controls[field.name]) {
                    this.form.removeControl(field.name, { emitEvent: false });
                }
                if (replaced && replaced !== control) replaced.setParent(null);
                controlsChanged = true;
            } else if (control) {
                const validationsChanged = !this.sameReferences(previous.validators, validators)
                    || !this.sameReferences(previous.asyncValidators, asyncValidators);
                const disabledChanged = !!previous.config.disabled !== !!field.disabled;
                if (validationsChanged) {
                    const binding = new KlesFormControl(field, this.ref);
                    control.setValidators(binding.bindValidations(field.validations ?? []));
                    control.setAsyncValidators(binding.bindAsyncValidations(field.asyncValidations ?? []));
                }
                if (disabledChanged) {
                    if (field.disabled) control.disable({ onlySelf: true, emitEvent: false });
                    else control.enable({ onlySelf: true, emitEvent: false });
                } else if (validationsChanged) {
                    control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
                }
                // Retain the existing legacy behavior for data groups; recursive removal
                // and array schema reconciliation belong to a later stage.
                if (field.type === EnumType.group) this.updateControl(field, control);
                controlsChanged ||= validationsChanged || disabledChanged || field.type === EnumType.group;
            }

            let uiDefaults = previous?.uiDefaults ?? {};
            const state = this.ui.get([field.name]);
            if (!compatible || !state || previous?.uiFactory !== uiFactory || !this.sameConfig(previous.config, field)) {
                const candidate = this.createUiState(field);
                uiDefaults = { ...(candidate.value() ?? {}) };
                if (compatible && state instanceof ControlUiState && candidate instanceof ControlUiState && previous.uiFactory === uiFactory) {
                    const patch: Record<string, unknown> = {};
                    for (const key of new Set([...Object.keys(previous.uiDefaults), ...Object.keys(uiDefaults)])) {
                        if (!Object.is(previous.uiDefaults[key], uiDefaults[key])) patch[key] = uiDefaults[key];
                    }
                    if (Object.keys(patch).length) state.patchValue(patch);
                } else {
                    this.ui.addUiState(field.name, candidate);
                }
            }
            next.set(field.name, {
                config: { ...field }, control, component, factory, uiFactory,
                validators, asyncValidators, uiDefaults,
            });
        }
        this.synchronizedFields = next;
        return controlsChanged;
    }

    private sameReferences<T>(previous: readonly T[], next: readonly T[]): boolean {
        return previous.length === next.length && previous.every((value, index) => Object.is(value, next[index]));
    }

    private sameConfig(previous: IKlesFieldConfig, next: IKlesFieldConfig): boolean {
        const keys = Object.keys(previous) as (keyof IKlesFieldConfig)[];
        return keys.length === Object.keys(next).length && keys.every((key) => Object.is(previous[key], next[key]));
    }

    private findMapping(field: IKlesFieldConfig) {
        return field.type
            ? componentMapper.find((candidate) => candidate.type === field.type)
            : componentMapper.find((candidate) => candidate.component === field.component);
    }

    private updateControl(field: IKlesFieldConfig, control: AbstractControl): AbstractControl {
        if (field.type === EnumType.array) {
            const array = control as FormArray;
            /*TODO*/
            return array;
        } else if (field.type === EnumType.group) {
            const group = control as FormGroup;
            if (field.collections && Array.isArray(field.collections)) {
                field.collections.forEach((subfield) => {
                    const existingControl = group.controls[subfield.name];
                    const updatedControl = existingControl ? this.updateControl(subfield, existingControl) : this.createControl(subfield);

                    if (updatedControl) {
                        group.setControl(subfield.name, updatedControl, { emitEvent: false });
                    }
                });
            }
            return group;
        } else {
            return control;
        }
    }

    private createControl(field: IKlesFieldConfig): AbstractControl | null {
        if (field.type === EnumType.lineBreak) return null;
        const mapping = this.findMapping(field);

        return mapping ? mapping.factory(field, this.ref) : klesFieldControlFactory(field, this.ref);
    }

    private createUiState(field: IKlesFieldConfig): AbstractUiState {
        const mapping = this.findMapping(field);

        return mapping?.ui(field) ?? klesFieldUiFactory(field);
    }

    private validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);
            control?.markAsTouched({ onlySelf: true });
        });
    }

    private normalizeColumns(value: number | undefined): number {
        if (value == null) return 12;
        const normalized = Number.isFinite(value) ? Math.min(64, Math.max(1, Math.round(value))) : 12;
        const warning = `[KlesDynamicForm] columns=${value} is invalid; using ${normalized}.`;
        if (isDevMode() && normalized !== value && !this.layoutWarnings.has(warning)) {
            this.layoutWarnings.add(warning);
            console.warn(warning);
        }
        return normalized;
    }
}
