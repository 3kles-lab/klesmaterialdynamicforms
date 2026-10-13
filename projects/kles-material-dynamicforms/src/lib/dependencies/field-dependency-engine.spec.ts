import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { EMPTY, Subject, of } from 'rxjs';
import { IKlesFormFieldsResolver, IKlesFormLayoutGroup, KlesFormElement } from '../interfaces/layout.interface';
import { KlesFormDependencyEngine } from './field-dependency-engine';

describe('KlesFormDependencyEngine', () => {
    const field = (name: string): KlesFormElement => ({ name });
    const container = (resolveFields: IKlesFormFieldsResolver, dependsOn?: string[]): IKlesFormLayoutGroup => ({
        type: 'layoutGroup', fields: [field('initial')], dependsOn, resolveFields,
    });
    let engines: KlesFormDependencyEngine[];
    const engineFor = (form: FormGroup) => {
        const engine = new KlesFormDependencyEngine(form);
        engines.push(engine);
        return engine;
    };
    beforeEach(() => {
        engines = [];
        spyOn(console, 'warn');
    });
    afterEach(() => engines.forEach((engine) => engine.destroy()));

    it('resolves initially and only when a declared value changes', () => {
        const form = new FormGroup({ category: new FormControl('one'), unrelated: new FormControl('value') });
        const resolver = jasmine.createSpy('resolve').and.returnValue([field('resolved')]);
        const slot = container(resolver, ['category', 'category']);
        const engine = engineFor(form);
        engine.update([slot]);
        expect(resolver).toHaveBeenCalledTimes(1);
        form.controls.category.setValue('one');
        form.controls.unrelated.setValue('next');
        engine.update([slot]);
        expect(resolver).toHaveBeenCalledTimes(1);
        form.controls.category.setValue('two');
        expect(resolver).toHaveBeenCalledTimes(2);
        expect(engine.states().get(slot)?.fields).toEqual([field('resolved')]);
        // Resolution alone does not mutate the declarative children or controls.
        expect(slot.fields).toEqual([field('initial')]);
        expect(form.get('resolved')).toBeNull();
    });

    it('captures root raw values and context, including disabled controls and nested paths', () => {
        const form = new FormGroup({
            address: new FormGroup({ country: new FormControl('FR') }),
            locked: new FormControl({ value: 'secret', disabled: true }),
        });
        let context = { label: 'first' };
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const slot = container(resolver, ['address.country']);
        const engine = new KlesFormDependencyEngine(form, () => context);
        engines.push(engine);
        engine.update([{ type: 'section', title: 'Outer', fields: [slot] }]);
        const initial = resolver.calls.mostRecent().args[0];
        expect(initial.group).toBe(form);
        expect(initial.element).toBe(slot);
        expect(initial.values).toEqual({ address: { country: 'FR' }, locked: 'secret' });
        context = { label: 'second' };
        engine.update([{ type: 'section', title: 'Outer', fields: [slot] }]);
        expect(resolver).toHaveBeenCalledTimes(1);
        form.controls.address.controls.country.setValue('BE');
        expect(resolver).toHaveBeenCalledTimes(2);
        expect(resolver.calls.mostRecent().args[0].context).toBe(context);
        expect(initial.values.address).toEqual({ country: 'FR' });
    });

    it('uses Object.is for object, NaN and signed-zero dependency values', () => {
        const value = { id: 1 };
        const control = new FormControl<unknown>(value);
        const form = new FormGroup({ value: control });
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const engine = engineFor(form);
        engine.update([container(resolver, ['value'])]);
        value.id = 2;
        control.setValue(value);
        expect(resolver).toHaveBeenCalledTimes(1);
        control.setValue({ id: 2 });
        control.setValue(NaN);
        control.setValue(NaN);
        control.setValue(0);
        control.setValue(-0);
        expect(resolver).toHaveBeenCalledTimes(5);
    });

    [undefined, []].forEach((dependencies) => {
        it(`resolves only initially with ${dependencies ? 'empty' : 'omitted'} dependencies`, () => {
            const form = new FormGroup({ category: new FormControl('one') });
            const resolver = jasmine.createSpy('resolve').and.returnValue([]);
            const slot = container(resolver, dependencies);
            const engine = engineFor(form);
            engine.update([slot]);
            form.controls.category.setValue('two');
            engine.update([slot]);
            expect(resolver).toHaveBeenCalledTimes(1);
            expect(engine.states().get(slot)?.status).toBe('ready');
        });
    });

    it('ignores dependsOn when no resolver is declared', () => {
        const engine = engineFor(new FormGroup({}));
        engine.update([{ type: 'layoutGroup', fields: [], dependsOn: ['missing'] }]);
        expect(engine.states().size).toBe(0);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('waits for missing controls, reports once and resumes when they appear', () => {
        const form = new UntypedFormGroup({});
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const slot = container(resolver, ['later']);
        const engine = engineFor(form);
        engine.update([slot]);
        engine.update([slot]);
        expect(resolver).not.toHaveBeenCalled();
        expect(engine.states().get(slot)?.status).toBe('waiting');
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('missing-control');
        expect(console.warn).toHaveBeenCalledTimes(1);
        form.addControl('later', new FormControl('ready'));
        expect(resolver).toHaveBeenCalledTimes(1);
        form.removeControl('later');
        expect(engine.states().get(slot)?.status).toBe('waiting');
        form.addControl('later', new FormControl('again'), { emitEvent: false });
        engine.update([slot]);
        expect(resolver).toHaveBeenCalledTimes(2);
    });

    ['','address..country','../country','address.*','address[0]',' category'].forEach((path) => {
        it(`rejects invalid dependency path '${path}'`, () => {
            const resolver = jasmine.createSpy('resolve').and.returnValue([]);
            const slot = container(resolver, [path]);
            const engine = engineFor(new FormGroup({}));
            engine.update([slot]);
            expect(resolver).not.toHaveBeenCalled();
            expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-path');
        });
    });

    it('switches Observable requests, retains successful fields while loading and accepts multiple results', () => {
        const form = new FormGroup({ category: new FormControl('one') });
        const requests: Subject<readonly KlesFormElement[]>[] = [];
        const slot = container(() => {
            const request = new Subject<readonly KlesFormElement[]>();
            requests.push(request);
            return request;
        }, ['category']);
        const engine = engineFor(form);
        engine.update([slot]);
        expect(engine.states().get(slot)?.status).toBe('loading');
        expect(engine.states().get(slot)?.fields).toEqual(slot.fields);
        requests[0].next([field('first')]);
        requests[0].next([field('second')]);
        form.controls.category.setValue('two');
        expect(requests[0].observed).toBeFalse();
        expect(engine.states().get(slot)?.status).toBe('loading');
        expect(engine.states().get(slot)?.fields).toEqual([field('second')]);
        requests[0].next([field('obsolete')]);
        requests[1].next([]);
        expect(engine.states().get(slot)?.fields).toEqual([]);
    });

    it('diagnoses non-string dependencies without failing graph traversal', () => {
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const slot = container(resolver, [42 as unknown as string]);
        const engine = engineFor(new FormGroup({}));
        expect(() => engine.update([slot])).not.toThrow();
        expect(resolver).not.toHaveBeenCalled();
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-path');
    });

    it('rejects results containing the container itself or one of its ancestors', () => {
        const resolver = jasmine.createSpy('resolve');
        const slot = container(resolver);
        const parent: KlesFormElement = { type: 'section', title: 'Parent', fields: [slot] };
        resolver.and.returnValue([slot]);
        const engine = engineFor(new FormGroup({}));
        engine.update([parent]);
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-result');
        slot.resolveFields = () => [parent];
        engine.update([parent]);
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-result');
        expect(engine.states().get(slot)?.fields).toEqual([field('initial')]);
    });

    it('ignores stale Promise results and rejected obsolete Promises', async () => {
        const form = new FormGroup({ category: new FormControl('one') });
        const pending: { resolve: (fields: KlesFormElement[]) => void; reject: (error: unknown) => void }[] = [];
        const slot = container(() => new Promise<KlesFormElement[]>((resolve, reject) => pending.push({ resolve, reject })), ['category']);
        const engine = engineFor(form);
        engine.update([slot]);
        form.controls.category.setValue('two');
        pending[0].reject(new Error('obsolete rejection'));
        pending[1].resolve([field('latest')]);
        await Promise.resolve();
        await Promise.resolve();
        expect(engine.states().get(slot)?.fields).toEqual([field('latest')]);
        expect(console.warn).not.toHaveBeenCalled();
        form.controls.category.setValue('three');
        form.controls.category.setValue('four');
        pending[3].resolve([field('four')]);
        pending[2].resolve([field('stale')]);
        await Promise.resolve();
        await Promise.resolve();
        expect(engine.states().get(slot)?.fields).toEqual([field('four')]);
    });

    it('keeps fields when a request completes without emitting', () => {
        const slot = container(() => EMPTY);
        const engine = engineFor(new FormGroup({}));
        engine.update([slot]);
        expect(engine.states().get(slot)?.status).toBe('ready');
        expect(engine.states().get(slot)?.fields).toEqual(slot.fields);
    });

    ['throw', 'observable', 'promise'].forEach((kind) => {
        it(`recovers after a ${kind} error on the next dependency change`, async () => {
            const form = new FormGroup({ category: new FormControl('one') });
            let failure = true;
            const slot = container(() => {
                if (!failure) return [field('recovered')];
                if (kind === 'throw') throw new Error('failed');
                if (kind === 'promise') return Promise.reject(new Error('failed'));
                const request = new Subject<KlesFormElement[]>();
                queueMicrotask(() => request.error(new Error('failed')));
                return request;
            }, ['category']);
            const engine = engineFor(form);
            engine.update([slot]);
            await Promise.resolve();
            await Promise.resolve();
            expect(engine.states().get(slot)?.status).toBe('error');
            expect(engine.states().get(slot)?.fields).toEqual(slot.fields);
            expect(engine.states().get(slot)?.diagnostic?.code).toBe('resolver-error');
            failure = false;
            form.controls.category.setValue('two');
            expect(engine.states().get(slot)?.status).toBe('ready');
            expect(engine.states().get(slot)?.fields).toEqual([field('recovered')]);
        });
    });

    it('validates malformed results without terminating dependency observation', () => {
        const form = new FormGroup({ category: new FormControl('one') });
        const resolver = jasmine.createSpy('resolve').and.returnValues('wrong', of([null]), of([{ type: 'layoutGroup' }]), []);
        const slot = container(resolver, ['category']);
        const engine = engineFor(form);
        engine.update([slot]);
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-result');
        form.controls.category.setValue('two');
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-result');
        form.controls.category.setValue('three');
        expect(engine.states().get(slot)?.diagnostic?.code).toBe('invalid-result');
        form.controls.category.setValue('four');
        expect(engine.states().get(slot)?.status).toBe('ready');
    });

    it('rebinds replaced controls and stops observing their old instances', () => {
        const previous = new FormControl('one');
        const form = new FormGroup({ category: previous });
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const slot = container(resolver, ['category']);
        const engine = engineFor(form);
        engine.update([slot]);
        const replacement = new FormControl('one');
        form.setControl('category', replacement);
        expect(resolver).toHaveBeenCalledTimes(2);
        previous.setValue('old');
        expect(resolver).toHaveBeenCalledTimes(2);
        replacement.setValue('new');
        expect(resolver).toHaveBeenCalledTimes(3);
    });

    it('restarts changed resolver/dependency configurations and disposes removed containers', () => {
        const form = new FormGroup({ first: new FormControl('one'), second: new FormControl('two') });
        const request = new Subject<KlesFormElement[]>();
        const slot = container(() => request, ['first']);
        const engine = engineFor(form);
        engine.update([slot]);
        const resolver = jasmine.createSpy('replacement').and.returnValue([]);
        slot.resolveFields = resolver;
        slot.dependsOn = ['second'];
        engine.update([slot]);
        expect(request.observed).toBeFalse();
        expect(resolver).toHaveBeenCalledTimes(1);
        form.controls.first.setValue('unobserved');
        expect(resolver).toHaveBeenCalledTimes(1);
        form.controls.second.setValue('observed');
        expect(resolver).toHaveBeenCalledTimes(2);
        engine.update([]);
        form.controls.second.setValue('removed');
        expect(resolver).toHaveBeenCalledTimes(2);
        expect(engine.states().size).toBe(0);
    });

    it('detects self-dependencies, cross-container cycles and blocked descendants before resolving', () => {
        const form = new FormGroup({ a: new FormControl('a'), b: new FormControl('b'), independent: new FormControl('ok') });
        const first = container(jasmine.createSpy('first'), ['b']);
        first.fields = [field('a')];
        const second = container(jasmine.createSpy('second'), ['a']);
        second.fields = [field('b')];
        const descendant = container(jasmine.createSpy('descendant'), ['a']);
        const independent = container(jasmine.createSpy('independent').and.returnValue([]), ['independent']);
        const engine = engineFor(form);
        engine.update([first, second, descendant, independent]);
        expect(first.resolveFields).not.toHaveBeenCalled();
        expect(second.resolveFields).not.toHaveBeenCalled();
        expect(descendant.resolveFields).not.toHaveBeenCalled();
        expect(independent.resolveFields).toHaveBeenCalledTimes(1);
        expect(engine.states().get(first)?.diagnostic?.code).toBe('cycle');
        expect(engine.states().get(second)?.diagnostic?.code).toBe('cycle');
        expect(engine.states().get(descendant)?.diagnostic?.code).toBe('blocked-dependency');
        first.dependsOn = ['independent'];
        first.resolveFields = () => [field('a')];
        second.resolveFields = () => [field('b')];
        descendant.resolveFields = () => [];
        engine.update([first, second, descendant]);
        expect(engine.states().get(first)?.status).toBe('ready');
        second.dependsOn = ['b'];
        engine.update([second]);
        expect(engine.states().get(second)?.diagnostic?.code).toBe('cycle');
    });

    it('rejects a cycle discovered in resolved field definitions and cancels involved requests', () => {
        const form = new FormGroup({ a: new FormControl('a'), b: new FormControl('b') });
        const request = new Subject<KlesFormElement[]>();
        const first = container(() => request, ['b']);
        first.fields = [];
        const second = container(() => [field('b')], ['a']);
        second.fields = [field('b')];
        const engine = engineFor(form);
        const resolved = jasmine.createSpy('resolved');
        engine.resolved$.subscribe(resolved);
        engine.update([first, second]);
        resolved.calls.reset();
        request.next([field('a')]);
        expect(request.observed).toBeFalse();
        expect(engine.states().get(first)?.diagnostic?.code).toBe('cycle');
        expect(engine.states().get(second)?.diagnostic?.code).toBe('cycle');
        expect(engine.states().get(first)?.fields).toEqual([]);
        expect(resolved).not.toHaveBeenCalled();
    });

    it('cleans up all subscriptions and streams on destruction', () => {
        const form = new FormGroup({ category: new FormControl('one') });
        const request = new Subject<KlesFormElement[]>();
        const resolver = jasmine.createSpy('resolve').and.returnValue(request);
        const engine = engineFor(form);
        const complete = jasmine.createSpy('completed');
        engine.resolved$.subscribe({ complete });
        engine.update([container(resolver, ['category'])]);
        engine.destroy();
        expect(request.observed).toBeFalse();
        expect(complete).toHaveBeenCalledTimes(1);
        form.controls.category.setValue('two');
        engine.update([]);
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(engine.states().size).toBe(0);
    });
});
