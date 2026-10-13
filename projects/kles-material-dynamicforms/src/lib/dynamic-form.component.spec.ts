import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatExpansionPanel } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KlesDynamicFormComponent } from './dynamic-form.component';
import { KlesFormInputComponent } from './fields/input.component';
import { KlesFormGroupComponent } from './fields/group.component';
import { KlesFormSelectComponent } from './fields/select.component';
import { KlesFormCheckboxComponent } from './fields/checkbox.component';
import { KlesFormLineBreakComponent } from './fields/line-break.component';
import { defer, of, Subject } from 'rxjs';
import { EnumType } from './enums/type.enum';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { IKlesFormDynamicFields, IKlesFormLayoutGroup, KlesFormElement } from './interfaces/layout.interface';

describe('KlesDynamicFormComponent', () => {
    const input = (name: string, colSpan?: number): IKlesFieldConfig => ({
        name,
        component: KlesFormInputComponent,
        ...(colSpan == null ? {} : { layout: { colSpan } }),
    });

    const createGrid = (fields: KlesFormElement[], direction: 'grid' | 'row' | 'column' = 'grid') => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, KlesFormCheckboxComponent, KlesFormLineBreakComponent, NoopAnimationsModule],
        });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('direction', direction);
        fixture.componentRef.setInput('fields', fields);
        fixture.detectChanges();
        return fixture;
    };

    it('keeps row, column and wrap compatibility', () => {
        TestBed.configureTestingModule({ imports: [KlesDynamicFormComponent, NoopAnimationsModule] });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);

        fixture.componentRef.setInput('direction', 'column');
        fixture.detectChanges();
        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.classList).toContain('dynamic-form-column');

        fixture.componentRef.setInput('direction', 'row');
        fixture.componentRef.setInput('wrap', true);
        fixture.detectChanges();
        expect(form.classList).toContain('dynamic-form-row');
        expect(form.classList).not.toContain('dynamic-form-nowrap');
    });

    it('prevents wrapping in row direction when wrap is false', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('direction', 'row');
        fixture.componentRef.setInput('wrap', false);
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.classList).toContain('dynamic-form-row');
        expect(form.classList).toContain('dynamic-form-nowrap');
    });

    it('focuses the explicitly declared target when autofocus is enabled', async () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [
            {
                name: 'focusedField',
                component: KlesFormInputComponent,
                autofocus: true,
            },
        ] satisfies IKlesFieldConfig[]);
        fixture.detectChanges();
        await fixture.whenStable();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(document.activeElement).toBe(input);
    });

    it('synchronizes children while retaining the root GroupUiState', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        const initialFields: IKlesFieldConfig[] = [
            {
                name: 'first',
                component: KlesFormInputComponent,
                appearance: 'fill',
            },
        ];
        fixture.componentRef.setInput('fields', initialFields);
        fixture.detectChanges();

        const initialUi = fixture.componentInstance.ui;
        expect(initialUi.get('first')?.value()?.appearance).toBe('fill');

        const nextFields: IKlesFieldConfig[] = [
            {
                name: 'second',
                component: KlesFormInputComponent,
                appearance: 'outline',
            },
        ];
        fixture.componentRef.setInput('fields', nextFields);
        fixture.detectChanges();

        expect(fixture.componentInstance.ui).toBe(initialUi);
        expect(fixture.componentInstance.ui.get('first')).toBeNull();
        expect(fixture.componentInstance.ui.get('second')?.value()?.appearance).toBe('outline');
        expect(fixture.componentInstance.form.get('first')).toBeNull();
        expect(fixture.componentInstance.form.get('second')).toBeInstanceOf(FormControl);
    });

    [false, true].forEach((advanced) => {
        it(`preserves mounted fields, option requests and current siblings in ${advanced ? 'grid' : 'legacy'} layout`, () => {
            TestBed.configureTestingModule({
                imports: [KlesDynamicFormComponent, KlesFormInputComponent, KlesFormSelectComponent, NoopAnimationsModule],
            });
            let requests = 0;
            const changes = jasmine.createSpy('valueChanges');
            const select: IKlesFieldConfig = {
                name: 'category', type: EnumType.select,
                options: defer(() => { requests++; return of(['one', 'two']); }),
            };
            const saved: IKlesFieldConfig = { ...input('saved'), valueChanges: changes };
            const fixture = TestBed.createComponent(KlesDynamicFormComponent);
            fixture.componentRef.setInput('direction', advanced ? 'grid' : 'column');
            fixture.componentRef.setInput('fields', [select, saved]);
            fixture.detectChanges();
            const component = fixture.componentInstance;
            const control = component.form.get('saved')!;
            const state = component.ui.get('saved')!;
            const node = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            const rendered = fixture.debugElement.query(By.directive(KlesFormInputComponent)).componentInstance as KlesFormInputComponent;
            control.setValue('saved value');
            control.markAsDirty();
            control.markAsTouched();
            state.patchValue({ hint: 'runtime hint' });
            node.focus();
            changes.calls.reset();

            fixture.componentRef.setInput('fields', [select, saved, input('new')]);
            fixture.detectChanges();
            expect(component.form.get('saved')).toBe(control);
            expect(component.ui.get('saved')).toBe(state);
            expect(state.value()?.hint).toBe('runtime hint');
            expect(control.value).toBe('saved value');
            expect(control.dirty).toBeTrue();
            expect(control.touched).toBeTrue();
            expect(fixture.nativeElement.querySelector('input')).toBe(node);
            expect(document.activeElement).toBe(node);
            expect(requests).toBe(1);
            expect(changes).not.toHaveBeenCalled();
            expect(rendered.siblingFields.map((field) => field.name)).toEqual(['category', 'saved', 'new']);

            fixture.componentRef.setInput('fields', [select, saved]);
            fixture.detectChanges();
            expect(component.form.get('new')).toBeNull();
            expect(component.ui.get('new')).toBeNull();
            expect(rendered.siblingFields.map((field) => field.name)).toEqual(['category', 'saved']);
            control.setValue('next');
            expect(changes).toHaveBeenCalledTimes(1);
            expect(changes.calls.mostRecent().args[2]).toBe(rendered.siblingFields);
            expect(requests).toBe(1);
        });
    });

    it('synchronizes children of nested visual containers without replacing unaffected fields', () => {
        const saved = input('saved');
        const children = { type: 'layoutGroup' as const, fields: [input('old')] };
        const section = { type: 'section' as const, title: 'Details', fields: [saved, children] };
        const fixture = createGrid([section]);
        const control = fixture.componentInstance.form.get('saved');
        const node = fixture.nativeElement.querySelector('input');
        children.fields = [input('new')];
        fixture.componentRef.setInput('fields', [section]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('old')).toBeNull();
        expect(fixture.componentInstance.ui.get('old')).toBeNull();
        expect(fixture.componentInstance.form.get('new')).toBeInstanceOf(FormControl);
        expect(fixture.componentInstance.form.get('saved')).toBe(control);
        expect(fixture.nativeElement.querySelector('input')).toBe(node);
    });

    it('updates and removes validators without losing compatible control values or interaction state', () => {
        const initial = input('saved');
        const fixture = createGrid([initial]);
        const control = fixture.componentInstance.form.get('saved')!;
        control.setValue('short');
        control.markAsDirty();
        control.markAsTouched();
        fixture.componentRef.setInput('fields', [{
            ...initial, validations: [{ name: 'minlength', validator: Validators.minLength(10) }],
        }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('saved')).toBe(control);
        expect(control.hasError('minlength')).toBeTrue();
        expect(fixture.componentInstance.form.invalid).toBeTrue();
        expect(control.value).toBe('short');
        expect(control.dirty && control.touched).toBeTrue();
        fixture.componentRef.setInput('fields', [initial]);
        fixture.detectChanges();
        expect(control.valid).toBeTrue();
        expect(fixture.componentInstance.form.valid).toBeTrue();
    });

    it('updates asynchronous validators and clears their previous errors', () => {
        const initial = input('saved');
        const fixture = createGrid([initial]);
        const control = fixture.componentInstance.form.get('saved')!;
        fixture.componentRef.setInput('fields', [{
            ...initial, asyncValidations: [{ name: 'blocked', validator: () => of({ blocked: true }) }],
        }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('saved')).toBe(control);
        expect(control.hasError('blocked')).toBeTrue();
        expect(fixture.componentInstance.form.invalid).toBeTrue();
        fixture.componentRef.setInput('fields', [initial]);
        fixture.detectChanges();
        expect(control.valid).toBeTrue();
        expect(fixture.componentInstance.form.valid).toBeTrue();
    });

    it('does not restart async validation when the unchanged field list is reassigned', () => {
        const validator = jasmine.createSpy('validator').and.returnValue(of(null));
        const saved: IKlesFieldConfig = { ...input('saved'), asyncValidations: [{ name: 'remote', validator }] };
        const fixture = createGrid([saved]);
        validator.calls.reset();
        fixture.componentRef.setInput('fields', [saved]);
        fixture.detectChanges();
        expect(validator).not.toHaveBeenCalled();
    });

    it('applies disabled configuration changes but preserves programmatic disabling on unrelated updates', () => {
        const initial = input('saved');
        const fixture = createGrid([initial]);
        const control = fixture.componentInstance.form.get('saved')!;
        control.setValue('kept');
        control.disable();
        fixture.componentRef.setInput('fields', [initial, input('other')]);
        fixture.detectChanges();
        expect(control.disabled).toBeTrue();
        fixture.componentRef.setInput('fields', [{ ...initial, disabled: true }, input('other')]);
        fixture.detectChanges();
        fixture.componentRef.setInput('fields', [{ ...initial, disabled: false }, input('other')]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('saved')).toBe(control);
        expect(control.enabled).toBeTrue();
        expect(control.value).toBe('kept');
        expect(fixture.componentInstance.form.value.saved).toBe('kept');
    });

    it('patches configured UI changes while preserving unrelated runtime UI adjustments', () => {
        const initial: IKlesFieldConfig = { ...input('saved'), label: 'Initial label' };
        const fixture = createGrid([initial]);
        const state = fixture.componentInstance.ui.get('saved')!;
        state.patchValue({ hint: 'Runtime hint' });
        fixture.componentRef.setInput('fields', [{ ...initial, label: 'Updated label' }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.ui.get('saved')).toBe(state);
        expect(state.value()?.label).toBe('Updated label');
        expect(state.value()?.hint).toBe('Runtime hint');
        expect(fixture.nativeElement.textContent).toContain('Updated label');
        expect(fixture.nativeElement.textContent).toContain('Runtime hint');
        fixture.componentRef.setInput('fields', [input('saved')]);
        fixture.detectChanges();
        expect(state.value()?.label).toBeUndefined();
        expect(state.value()?.hint).toBe('Runtime hint');
    });

    it('recreates incompatible fields with their declared initial value', () => {
        const fixture = createGrid([input('value')]);
        const control = fixture.componentInstance.form.get('value')!;
        const state = fixture.componentInstance.ui.get('value');
        control.setValue('text');
        control.markAsDirty();
        fixture.componentRef.setInput('fields', [{ name: 'value', type: EnumType.checkbox, value: true }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('value')).not.toBe(control);
        expect(fixture.componentInstance.ui.get('value')).not.toBe(state);
        expect(fixture.componentInstance.form.get('value')?.value).toBeTrue();
        expect(fixture.componentInstance.form.get('value')?.pristine).toBeTrue();
        expect(fixture.nativeElement.querySelector('mat-checkbox')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('input[type="text"]')).toBeNull();
    });

    it('rebinds a replaced control when creation options change on the same configuration object', () => {
        const field = input('value');
        const fixture = createGrid([field]);
        const control = fixture.componentInstance.form.get('value')!;
        field.updateOn = 'blur';
        field.nonNullable = true;
        field.value = 'initial';
        fixture.componentRef.setInput('fields', [field]);
        fixture.detectChanges();
        const replacement = fixture.componentInstance.form.get('value')!;
        expect(replacement).not.toBe(control);
        expect(replacement.updateOn).toBe('blur');
        const node = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        node.value = 'typed';
        node.dispatchEvent(new Event('input'));
        expect(replacement.value).toBe('initial');
        node.dispatchEvent(new Event('blur'));
        expect(replacement.value).toBe('typed');
        replacement.reset();
        expect(replacement.value).toBe('initial');
    });

    it('removes a previous control when a named field becomes a control-free element', () => {
        const fixture = createGrid([input('value')]);
        fixture.componentRef.setInput('fields', [{ name: 'value', type: EnumType.lineBreak }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('value')).toBeNull();
        expect(fixture.componentInstance.form.getRawValue()).toEqual({});
        expect(fixture.nativeElement.querySelector('input')).toBeNull();
    });

    it('detaches removed UI states so later patches cannot restore deleted values', () => {
        const fixture = createGrid([input('removed'), input('saved')]);
        const state = fixture.componentInstance.ui.get('removed')!;
        const removedControl = fixture.componentInstance.form.get('removed')!;
        fixture.componentRef.setInput('fields', [input('saved')]);
        fixture.detectChanges();
        state.patchValue({ label: 'late update' });
        expect(fixture.componentInstance.ui.get('removed')).toBeNull();
        expect(fixture.componentInstance.ui.value()).not.toEqual(jasmine.objectContaining({ removed: jasmine.anything() }));
        const changes = jasmine.createSpy('form changes');
        fixture.componentInstance.form.valueChanges.subscribe(changes);
        removedControl.setValue('late value');
        expect(removedControl.parent).toBeNull();
        expect(changes).not.toHaveBeenCalled();
    });

    it('emits the complete synchronized form once instead of intermediate structural values', () => {
        const saved = { ...input('saved'), value: 'kept' };
        const fixture = createGrid([input('removed'), saved]);
        const changes = jasmine.createSpy('form changes').and.callFake(() => {
            expect(fixture.componentInstance.ui.get('removed')).toBeNull();
            expect(fixture.componentInstance.ui.get('added')).not.toBeNull();
        });
        fixture.componentInstance.form.valueChanges.subscribe(changes);
        fixture.componentRef.setInput('fields', [saved, { ...input('added'), value: 'new' }]);
        fixture.detectChanges();
        expect(changes).toHaveBeenCalledOnceWith({ saved: 'kept', added: 'new' });
    });

    it('rejects duplicate names across visual containers before changing controls', () => {
        const fixture = createGrid([input('saved')]);
        const control = fixture.componentInstance.form.get('saved');
        fixture.componentRef.setInput('fields', [
            input('duplicate'), { type: 'layoutGroup', fields: [input('duplicate')] },
        ]);
        expect(() => fixture.detectChanges()).toThrowError(/Duplicate field name 'duplicate'/);
        expect(fixture.componentInstance.form.get('saved')).toBe(control);
        expect(fixture.componentInstance.form.get('duplicate')).toBeNull();
    });

    it('revalidates the form when its validator configuration changes', () => {
        const fixture = createGrid([input('value')]);
        fixture.componentRef.setInput('fields', [input('value')]);
        fixture.componentRef.setInput('validators', [{ name: 'blocked', validator: () => ({ blocked: true }) }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.hasError('blocked')).toBeTrue();
        fixture.componentRef.setInput('validators', []);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.valid).toBeTrue();
    });

    it('executes dependency resolvers and synchronizes their children without changing the supplied configuration', () => {
        const resolver = jasmine.createSpy('resolve').and.returnValue([input('future')]);
        const slot: IKlesFormLayoutGroup = {
            type: 'layoutGroup', fields: [input('initial')], dependsOn: ['category'], resolveFields: resolver,
        };
        const category = { ...input('category'), value: 'one' };
        const fixture = createGrid([category, slot]);
        const component = fixture.componentInstance;
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(component.fieldResolutions().get(slot)?.status).toBe('ready');
        expect(component.fieldResolutions().get(slot)?.fields).toEqual([input('future')]);
        expect(component.form.get('initial')).toBeNull();
        expect(component.form.get('future')).not.toBeNull();
        expect(slot.fields).toEqual([input('initial')]);
        component.form.get('category')!.setValue('two');
        expect(resolver).toHaveBeenCalledTimes(2);
        fixture.componentRef.setInput('fields', [category, slot, input('unrelated')]);
        fixture.detectChanges();
        expect(resolver).toHaveBeenCalledTimes(2);
    });

    it('refreshes dependencies after replacing a control with different creation options', () => {
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const slot: IKlesFormLayoutGroup = {
            type: 'layoutGroup', fields: [], dependsOn: ['category'], resolveFields: resolver,
        };
        const category = { ...input('category'), value: 'one' };
        const fixture = createGrid([category, slot]);
        const oldControl = fixture.componentInstance.form.get('category')!;
        fixture.componentRef.setInput('fields', [{ ...category, updateOn: 'blur' }, slot]);
        fixture.detectChanges();
        expect(resolver).toHaveBeenCalledTimes(2);
        oldControl.setValue('obsolete');
        expect(resolver).toHaveBeenCalledTimes(2);
        fixture.componentInstance.form.get('category')!.setValue('new');
        expect(resolver).toHaveBeenCalledTimes(3);
    });

    it('waits for a dependency added by a later field configuration', () => {
        spyOn(console, 'warn');
        const resolver = jasmine.createSpy('resolve').and.returnValue([]);
        const slot: IKlesFormLayoutGroup = {
            type: 'layoutGroup', fields: [], dependsOn: ['later'], resolveFields: resolver,
        };
        const fixture = createGrid([slot]);
        expect(resolver).not.toHaveBeenCalled();
        expect(fixture.componentInstance.fieldResolutions().get(slot)?.status).toBe('waiting');
        fixture.componentRef.setInput('fields', [input('later'), slot]);
        fixture.detectChanges();
        expect(resolver).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.fieldResolutions().get(slot)?.status).toBe('ready');
    });

    it('disposes pending dependency requests when a container or the form is removed', () => {
        const request = new Subject<KlesFormElement[]>();
        const slot: IKlesFormLayoutGroup = { type: 'layoutGroup', fields: [], resolveFields: () => request };
        const fixture = createGrid([slot]);
        expect(request.observed).toBeTrue();
        fixture.componentRef.setInput('fields', []);
        fixture.detectChanges();
        expect(request.observed).toBeFalse();
        expect(fixture.componentInstance.fieldResolutions().size).toBe(0);
        fixture.componentRef.setInput('fields', [slot]);
        fixture.detectChanges();
        expect(request.observed).toBeTrue();
        fixture.destroy();
        expect(request.observed).toBeFalse();
    });

    it('mounts async results in place while keeping focus and unaffected widgets', () => {
        const request = new Subject<KlesFormElement[]>();
        const slot: IKlesFormLayoutGroup = {
            type: 'layoutGroup', fields: [], dependsOn: ['category'], resolveFields: () => request,
        };
        const base = { ...input('base'), label: 'Base' };
        const fixture = createGrid([base, { ...input('category'), label: 'Category' }, slot, { ...input('last'), label: 'Last' }]);
        const component = fixture.componentInstance;
        const control = component.form.get('base')!;
        const node = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        control.setValue('saved');
        control.markAsDirty();
        control.markAsTouched();
        node.focus();
        request.next([{ ...input('added'), label: 'Added', validations: [{ name: 'required', validator: Validators.required }] }]);
        fixture.detectChanges();
        expect(component.form.get('added')?.hasError('required')).toBeTrue();
        expect(component.form.get('base')).toBe(control);
        expect(control.value).toBe('saved');
        expect(control.dirty && control.touched).toBeTrue();
        expect(fixture.nativeElement.querySelector('input')).toBe(node);
        expect(document.activeElement).toBe(node);
        const labels = Array.from(fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<Element>).map((label) => label.textContent?.trim());
        expect(labels).toEqual(['Base', 'Category', 'Added', 'Last']);
        request.next([]);
        fixture.detectChanges();
        expect(component.form.get('added')).toBeNull();
        expect(component.ui.get('added')).toBeNull();
        expect(component.form.getRawValue().base).toBe('saved');
    });

    (['column', 'row'] as const).forEach((direction) => {
        it(`inserts dynamicFields directly in the ${direction} layout without rebuilding neighboring widgets`, () => {
            let optionLoads = 0;
            const request = new Subject<KlesFormElement[]>();
            const slot: IKlesFormDynamicFields = {
                type: 'dynamicFields', fields: [], dependsOn: ['category'], resolveFields: () => request,
            };
            const select: IKlesFieldConfig = {
                name: 'category', label: 'category', component: KlesFormSelectComponent, value: 'one',
                options: defer(() => { optionLoads++; return of(['one', 'two']); }),
            };
            const fixture = createGrid([{ ...input('base'), label: 'base' }, select, slot, { ...input('last'), label: 'last' }], direction);
            const component = fixture.componentInstance;
            const control = component.form.get('base')!;
            const node = fixture.nativeElement.querySelector('input') as HTMLInputElement;
            control.setValue('saved');
            control.markAsDirty();
            control.markAsTouched();
            node.focus();
            request.next([{ ...input('added'), label: 'added' }]);
            fixture.detectChanges();
            const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
            expect(form.classList).toContain(`dynamic-form-${direction}`);
            expect(component.usesAdvancedLayout).toBeFalse();
            expect(form.querySelector('.kles-layout-item, .kles-layout-grid, kles-form-elements')).toBeNull();
            expect(Array.from(form.querySelectorAll('mat-label')).map((element) => element.textContent?.trim()))
                .toEqual(['base', 'category', 'added', 'last']);
            expect(component.form.get('base')).toBe(control);
            expect(control.value).toBe('saved');
            expect(control.dirty && control.touched).toBeTrue();
            expect(form.querySelector('input')).toBe(node);
            expect(document.activeElement).toBe(node);
            expect(optionLoads).toBe(1);
            expect(slot.fields).toEqual([]);
            request.next([]);
            fixture.detectChanges();
            expect(component.form.get('added')).toBeNull();
            expect(component.ui.get('added')).toBeNull();
            expect(optionLoads).toBe(1);
        });
    });

    it('places nested dynamicFields children into the existing grid with its column count', () => {
        const request = new Subject<KlesFormElement[]>();
        const slot: IKlesFormDynamicFields = { type: 'dynamicFields', fields: [], resolveFields: () => request };
        const fixture = createGrid([{
            type: 'layoutGroup', layoutConfig: { columns: 6, gap: '9px' },
            fields: [input('first', 2), slot, input('last', 2)],
        }]);
        request.next([{ type: 'dynamicFields', fields: [input('inserted', 3)] }]);
        fixture.detectChanges();
        const grid = fixture.nativeElement.querySelector('.kles-layout-grid') as HTMLElement;
        const cells = Array.from(grid.querySelectorAll('.kles-layout-item')) as HTMLElement[];
        expect(fixture.nativeElement.querySelectorAll('.kles-layout-grid').length).toBe(1);
        expect(cells.length).toBe(3);
        expect(cells.map((cell) => cell.style.getPropertyValue('--kles-col-span'))).toEqual(['2', '3', '2']);
        expect(grid.style.getPropertyValue('--kles-grid-columns')).toBe('6');
        expect(fixture.componentInstance.form.get('inserted')).not.toBeNull();
    });

    it('detects root placement on dynamicFields children just like direct fields', () => {
        const slot: IKlesFormDynamicFields = {
            type: 'dynamicFields', fields: [], resolveFields: () => [input('placed', 6)],
        };
        const fixture = createGrid([slot], 'column');
        expect(fixture.componentInstance.orientationClass).toBe('dynamic-form-grid');
        expect(fixture.nativeElement.querySelectorAll('.kles-layout-item').length).toBe(1);
    });

    it('preserves compatible resolved values while updating their validators', () => {
        const request = new Subject<KlesFormElement[]>();
        const slot: IKlesFormLayoutGroup = { type: 'layoutGroup', fields: [], resolveFields: () => request };
        const fixture = createGrid([slot]);
        request.next([{ ...input('detail'), value: 'initial' }]);
        fixture.detectChanges();
        const control = fixture.componentInstance.form.get('detail')!;
        const state = fixture.componentInstance.ui.get('detail');
        control.setValue('short');
        control.markAsDirty();
        request.next([{ ...input('detail'), value: 'new default', validations: [{ name: 'minlength', validator: Validators.minLength(10) }] }]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('detail')).toBe(control);
        expect(fixture.componentInstance.ui.get('detail')).toBe(state);
        expect(control.value).toBe('short');
        expect(control.dirty).toBeTrue();
        expect(control.hasError('minlength')).toBeTrue();
    });

    it('registers nested generated resolvers and settles cascades before emitting the final form value', () => {
        const nestedResolver = jasmine.createSpy('nested').and.returnValue([input('city')]);
        const nested: IKlesFormDynamicFields = { type: 'dynamicFields', fields: [], dependsOn: ['country'], resolveFields: nestedResolver };
        const parent: IKlesFormLayoutGroup = {
            type: 'layoutGroup', fields: [], dependsOn: ['category'],
            resolveFields: ({ values }) => values['category'] === 'none' ? [] : [{ ...input('country'), value: 'FR' }, nested],
        };
        const fixture = createGrid([{ ...input('category'), value: 'none' }, parent]);
        const changes = jasmine.createSpy('changes');
        fixture.componentInstance.form.valueChanges.subscribe(changes);
        fixture.componentInstance.form.get('category')!.setValue('company');
        fixture.detectChanges();
        const country = fixture.componentInstance.form.get('country')!;
        expect(country.value).toBe('FR');
        expect(fixture.componentInstance.form.get('city')).not.toBeNull();
        expect(nestedResolver).toHaveBeenCalledTimes(1);
        expect(changes.calls.allArgs().every(([value]) => value.city !== undefined || Object.prototype.hasOwnProperty.call(value, 'city'))).toBeTrue();
        fixture.componentInstance.form.get('category')!.setValue('none');
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('country')).toBeNull();
        expect(fixture.componentInstance.form.get('city')).toBeNull();
        expect(fixture.componentInstance.fieldResolutions().has(nested)).toBeFalse();
        country.setValue('obsolete');
        expect(nestedResolver).toHaveBeenCalledTimes(1);
        expect(parent.fields).toEqual([]);
    });

    it('keeps current controls and values when a resolved schema has duplicate names, then recovers', () => {
        spyOn(console, 'warn');
        const request = new Subject<KlesFormElement[]>();
        const slot: IKlesFormLayoutGroup = { type: 'layoutGroup', fields: [], dependsOn: ['category'], resolveFields: () => request };
        const fixture = createGrid([input('fixed'), input('category'), slot]);
        request.next([input('detail')]);
        fixture.detectChanges();
        const detail = fixture.componentInstance.form.get('detail')!;
        detail.setValue('saved');
        request.next([input('fixed')]);
        fixture.detectChanges();
        expect(fixture.componentInstance.fieldResolutions().get(slot)?.diagnostic?.code).toBe('invalid-result');
        expect(fixture.componentInstance.form.get('detail')).toBe(detail);
        expect(detail.value).toBe('saved');
        fixture.componentInstance.form.get('category')!.setValue('retry');
        request.next([input('recovered')]);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.get('detail')).toBeNull();
        expect(fixture.componentInstance.form.get('recovered')).not.toBeNull();
    });

    it('accepts frozen declarative containers and never writes resolved children into their fields', () => {
        const slot: IKlesFormLayoutGroup = Object.freeze({
            type: 'layoutGroup' as const, fields: Object.freeze([]) as unknown as KlesFormElement[],
            resolveFields: () => [input('resolved')],
        });
        const fixture = createGrid([slot]);
        expect(fixture.componentInstance.form.get('resolved')).not.toBeNull();
        expect(slot.fields).toEqual([]);
        expect(fixture.componentInstance.renderedFields[0]).not.toBe(slot);
    });

    [
        { spans: [6, 6], label: '6 + 6' },
        { spans: [12], label: '12' },
        { spans: [4, 8], label: '4 + 8' },
        { spans: [4, 4, 4], label: '4 + 4 + 4' },
    ].forEach(({ spans, label }) => {
        it(`renders grid spans ${label}`, () => {
            const fixture = createGrid(spans.map((span, index) => input(`field${index}`, span)));
            const cells = Array.from(fixture.nativeElement.querySelectorAll('.kles-layout-item')) as HTMLElement[];
            expect(cells.map((cell) => cell.style.getPropertyValue('--kles-col-span'))).toEqual(spans.map(String));
        });
    });

    it('defaults fields to the full grid width', () => {
        const fixture = createGrid([input('full')]);
        const form = fixture.nativeElement.querySelector('form') as HTMLElement;
        const cell = fixture.nativeElement.querySelector('.kles-layout-item') as HTMLElement;
        expect(form.style.getPropertyValue('--kles-grid-gap')).toBe('0');
        expect(cell.style.getPropertyValue('--kles-col-span')).toBe('12');
    });

    it('automatically enables the grid when a root field declares layout', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, NoopAnimationsModule],
        });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [input('first', 6), input('second', 6)]);
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('form') as HTMLElement;
        expect(form.classList).toContain('dynamic-form-grid');
        expect(form.classList).not.toContain('dynamic-form-column');
        expect(fixture.nativeElement.querySelectorAll('.kles-layout-item').length).toBe(2);
    });

    it('supports custom columns, gap, starts, row spans and custom classes', () => {
        const field = input('placed');
        field.layout = { colStart: 3, colSpan: 8, rowStart: 2, rowSpan: 2, class: ['class-a', 'class-b'] };
        const fixture = createGrid([field]);
        fixture.componentRef.setInput('layout', { columns: 12, gap: '16px' });
        fixture.detectChanges();
        const form = fixture.nativeElement.querySelector('form') as HTMLElement;
        const cell = fixture.nativeElement.querySelector('.kles-layout-item') as HTMLElement;
        expect(form.style.getPropertyValue('--kles-grid-columns')).toBe('12');
        expect(form.style.getPropertyValue('--kles-grid-gap')).toBe('16px');
        expect(cell.style.getPropertyValue('--kles-col-start')).toBe('3');
        expect(cell.style.getPropertyValue('--kles-row-start')).toBe('2');
        expect(cell.style.getPropertyValue('--kles-row-span')).toBe('2');
        expect(cell.classList).toContain('class-a');
        expect(cell.classList).toContain('class-b');
    });

    it('clamps invalid placement values and warns in development', () => {
        const warn = spyOn(console, 'warn');
        const fixture = createGrid([{ ...input('invalid'), layout: { colStart: 20, colSpan: 15, rowSpan: 0 } }]);
        const cell = fixture.nativeElement.querySelector('.kles-layout-item') as HTMLElement;
        expect(cell.style.getPropertyValue('--kles-col-start')).toBe('12');
        expect(cell.style.getPropertyValue('--kles-col-span')).toBe('1');
        expect(cell.style.getPropertyValue('--kles-row-span')).toBe('1');
        expect(warn).toHaveBeenCalled();
    });

    it('exposes responsive placement through CSS custom properties', () => {
        const fixture = createGrid([{
            ...input('responsive'),
            layout: { colSpan: 6, responsive: { xs: { colSpan: 12 }, md: { colStart: 2, colSpan: 10 } } },
        }]);
        const cell = fixture.nativeElement.querySelector('.kles-layout-item') as HTMLElement;
        expect(cell.style.getPropertyValue('--kles-col-span')).toBe('6');
        expect(cell.style.getPropertyValue('--kles-col-span-xs')).toBe('12');
        expect(cell.style.getPropertyValue('--kles-col-start-md')).toBe('2');
        expect(cell.style.getPropertyValue('--kles-col-span-md')).toBe('10');
    });

    it('does not create controls for sections or visual groups but creates their nested fields', () => {
        const fixture = createGrid([
            {
                type: 'section',
                title: 'Personal information',
                icon: 'person',
                fields: [
                    input('firstname', 6),
                    {
                        type: 'layoutGroup',
                        layoutConfig: { columns: 12, gap: '16px' },
                        fields: [input('lastname', 6), input('email', 12)],
                    },
                ],
            },
        ]);
        const form = fixture.componentInstance.form;
        expect(form.get('section')).toBeNull();
        expect(form.get('group')).toBeNull();
        expect(form.get('firstname')).toBeInstanceOf(FormControl);
        expect(form.get('lastname')).toBeInstanceOf(FormControl);
        expect(form.get('email')).toBeInstanceOf(FormControl);
        expect(fixture.nativeElement.querySelector('h3').textContent).toContain('Personal information');
        expect(fixture.nativeElement.querySelector('.kles-form-section-title mat-icon').textContent).toContain('person');
        expect(fixture.nativeElement.querySelectorAll('.kles-layout-grid').length).toBe(2);
    });

    it('supports multiple independent sections', () => {
        const fixture = createGrid([
            { type: 'section', title: 'One', fields: [input('one')] },
            { type: 'section', title: 'Two', fields: [input('two')] },
        ]);
        expect(fixture.nativeElement.querySelectorAll('.kles-form-section').length).toBe(2);
        expect(Object.keys(fixture.componentInstance.form.controls)).toEqual(['one', 'two']);
        expect(fixture.nativeElement.querySelector('mat-expansion-panel')).toBeNull();
    });

    it('toggles sections independently while preserving mounted fields and validation', () => {
        const fixture = createGrid([
            { type: 'section', title: 'One', icon: 'person', description: 'Details', collapsible: true, fields: [input('one')] },
            { type: 'section', title: 'Two', collapsible: true, expanded: false, fields: [input('two')] },
        ]);
        const panels = fixture.debugElement.queryAll(By.directive(MatExpansionPanel));
        const first = panels[0].componentInstance as MatExpansionPanel;
        const second = panels[1].componentInstance as MatExpansionPanel;
        const headers = fixture.nativeElement.querySelectorAll('mat-expansion-panel-header') as NodeListOf<HTMLElement>;
        const control = fixture.componentInstance.form.get('one')!;
        const inputElement = panels[0].nativeElement.querySelector('input');
        control.setValidators(Validators.required);
        control.setValue('Saved value');
        control.markAsDirty();
        control.markAsTouched();
        fixture.detectChanges();

        expect(first.expanded).toBeTrue();
        expect(second.expanded).toBeFalse();
        expect(headers[0].textContent).toContain('Details');
        expect(headers[0].querySelector('mat-icon')!.textContent).toContain('person');
        headers[0].click();
        fixture.detectChanges();
        expect(first.expanded).toBeFalse();
        expect(headers[0].getAttribute('aria-expanded')).toBe('false');
        expect(fixture.componentInstance.form.get('one')).toBe(control);
        expect(panels[0].nativeElement.querySelector('input')).toBe(inputElement);
        expect(control.value).toBe('Saved value');
        expect(control.dirty).toBeTrue();
        expect(control.touched).toBeTrue();
        control.setValue('');
        expect(fixture.componentInstance.form.invalid).toBeTrue();

        headers[1].dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, bubbles: true }));
        fixture.detectChanges();
        expect(second.expanded).toBeTrue();
        expect(first.expanded).toBeFalse();
        headers[0].click();
        fixture.detectChanges();
        expect(first.expanded).toBeTrue();
        expect(second.expanded).toBeTrue();
        expect(panels[0].nativeElement.querySelector('input')).toBe(inputElement);
    });

    it('supports nested panels and changes to their configured expansion state', () => {
        const fields: KlesFormElement[] = [
            {
                type: 'section', title: 'Outer', collapsible: true, expanded: false,
                fields: [{ type: 'section', title: 'Inner', collapsible: true, fields: [input('nested')] }],
            },
        ];
        const fixture = createGrid(fields);
        const panels = fixture.debugElement.queryAll(By.directive(MatExpansionPanel));
        const outer = panels[0].componentInstance as MatExpansionPanel;
        const inner = panels[1].componentInstance as MatExpansionPanel;
        expect(outer.expanded).toBeFalse();
        expect(inner.expanded).toBeTrue();
        expect(fixture.componentInstance.form.get('nested')).toBeInstanceOf(FormControl);
        if (fields[0].type === 'section') fields[0].expanded = true;
        fixture.componentRef.setInput('fields', [...fields]);
        fixture.detectChanges();
        expect(outer.expanded).toBeTrue();
        inner.close();
        fixture.detectChanges();
        expect(outer.expanded).toBeTrue();
        expect(inner.expanded).toBeFalse();
    });

    it('opens and closes all collapsible sections through the dynamic form API', () => {
        const fixture = createGrid([
            {
                type: 'section', title: 'Plain', fields: [
                    {
                        type: 'layoutGroup', fields: [
                            {
                                type: 'section', title: 'Outer', collapsible: true, expanded: false,
                                fields: [{ type: 'section', title: 'Inner', collapsible: true, fields: [input('nested')] }],
                            },
                        ],
                    },
                ],
            },
            { type: 'section', title: 'Sibling', collapsible: true, fields: [input('sibling')] },
        ]);
        const panels = fixture.debugElement.queryAll(By.directive(MatExpansionPanel))
            .map((element) => element.componentInstance as MatExpansionPanel);
        expect(panels.length).toBe(3);
        fixture.componentInstance.collapseAllSections();
        fixture.detectChanges();
        expect(panels.every((panel) => !panel.expanded)).toBeTrue();
        fixture.componentInstance.expandAllSections();
        fixture.detectChanges();
        expect(panels.every((panel) => panel.expanded)).toBeTrue();
        fixture.componentInstance.collapseAllSections();
        fixture.detectChanges();
        expect(panels.every((panel) => !panel.expanded)).toBeTrue();
        expect(Object.keys(fixture.componentInstance.form.controls)).toEqual(['nested', 'sibling']);
        expect(fixture.nativeElement.querySelectorAll('section.kles-form-section').length).toBe(1);
    });

    it('allows bulk section operations on forms without sections', () => {
        const fixture = createGrid([input('plain')]);
        expect(() => fixture.componentInstance.expandAllSections()).not.toThrow();
        expect(() => fixture.componentInstance.collapseAllSections()).not.toThrow();
    });

    it('keeps the named EnumType.group as a data-bearing FormGroup', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormGroupComponent, KlesFormInputComponent, NoopAnimationsModule],
        });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [
            {
                type: EnumType.group,
                name: 'address',
                collections: [input('city')],
            },
        ] satisfies IKlesFieldConfig[]);
        fixture.detectChanges();

        expect(fixture.componentInstance.form.get('address')).toBeInstanceOf(FormGroup);
        expect(fixture.componentInstance.form.get('address.city')).toBeInstanceOf(FormControl);
    });
});
