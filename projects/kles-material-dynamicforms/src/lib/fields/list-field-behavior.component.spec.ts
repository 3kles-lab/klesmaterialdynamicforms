import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { KlesDynamicFormComponent } from '../dynamic-form.component';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { IKlesFieldConfig, IKlesListFieldOptions } from '../interfaces/field.config.interface';
import { KlesFormInputComponent } from './input.component';
import { KlesFormButtonComponent } from './button-form.component';
import { KlesFormListFieldComponent } from './list-field.component';

describe('KlesFormListFieldComponent interactions', () => {
    let fixture: ComponentFixture<KlesDynamicFormComponent>;
    let list: KlesFormListFieldComponent;
    let announce: jasmine.Spy;

    function create(options: IKlesListFieldOptions = {}, overrides: Partial<IKlesFieldConfig> = {}, intl = new KlesDynamicFormIntl()) {
        announce = jasmine.createSpy('announce').and.returnValue(Promise.resolve());
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, NoopAnimationsModule],
            providers: [{ provide: LiveAnnouncer, useValue: { announce } }, { provide: KlesDynamicFormIntl, useValue: intl }],
        });
        fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [{
            name: 'items',
            component: KlesFormListFieldComponent,
            value: [{ label: 'First' }, { label: 'Second' }, { label: 'Third' }],
            collections: [
                { name: 'label', component: KlesFormInputComponent },
                { name: 'value', component: KlesFormInputComponent },
            ],
            listFieldOptions: options,
            ...overrides,
        } satisfies IKlesFieldConfig]);
        fixture.detectChanges();
        list = fixture.debugElement.query(By.directive(KlesFormListFieldComponent)).componentInstance;
    }

    async function render() {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function rows(): HTMLElement[] {
        return Array.from(fixture.nativeElement.querySelectorAll('.list-field__row'));
    }

    afterEach(() => fixture?.destroy());

    it('keeps the existing presentation and expanded fields by default', () => {
        create();
        expect(fixture.nativeElement.querySelector('.list-field__item-header')).toBeNull();
        expect(fixture.nativeElement.querySelector('.list-field__toggle')).toBeNull();
        expect(fixture.nativeElement.querySelector('.list-field__drag')).toBeNull();
        expect(rows().every((row) => !(row.querySelector('.list-field__fields') as HTMLElement).hidden)).toBeTrue();
    });

    it('honors explicit showHeader false even with title, collapse and reorder options enabled', async () => {
        create({ showHeader: false, title: 'Processus', titleField: 'label', collapsible: true, expanded: false, reorderable: true });
        expect(fixture.nativeElement.querySelector('.list-field__item-header')).toBeNull();
        expect(fixture.nativeElement.querySelector('.list-field__toggle')).toBeNull();
        expect(rows().every((row) => {
            const body = row.querySelector('.list-field__fields') as HTMLElement;
            return !body.hidden && body.getAttribute('aria-labelledby') === null && body.getAttribute('role') === null;
        })).toBeTrue();
        expect(rows()[0].querySelector('.list-field__delete')).not.toBeNull();
        const group = list.formArray.at(0);
        const handle = rows()[0].querySelector('.list-field__drag') as HTMLButtonElement;
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        await render();
        expect(list.formArray.at(1)).toBe(group);
    });

    it('shows collapsed fields when the header is hidden and restores collapse without rebuilding controls', async () => {
        create({ showHeader: true, collapsible: true, expanded: false });
        const group = list.formArray.at(0);
        const input = rows()[0].querySelector('input');
        const body = rows()[0].querySelector('.list-field__fields') as HTMLElement;
        const changeDetector = fixture.debugElement.query(By.directive(KlesFormListFieldComponent)).injector.get(ChangeDetectorRef);
        expect(body.hidden).toBeTrue();
        list.field.listFieldOptions = { showHeader: false, collapsible: true, expanded: false };
        changeDetector.markForCheck();
        await render();
        expect(body.hidden).toBeFalse();
        expect(body.getAttribute('aria-labelledby')).toBeNull();
        expect(rows()[0].querySelector('input')).toBe(input);
        expect(list.formArray.at(0)).toBe(group);
        list.field.listFieldOptions = { showHeader: true, collapsible: true, expanded: false };
        changeDetector.markForCheck();
        await render();
        expect(body.hidden).toBeTrue();
        expect(rows()[0].querySelector('input')).toBe(input);
        expect(list.formArray.at(0)).toBe(group);
    });

    it('hides only the title while keeping collapse, error indicators and contextual accessible commands', async () => {
        const intl = new KlesDynamicFormIntl();
        intl.listFieldDelete = (title) => 'Supprimer ' + title;
        create({ showHeader: true, showTitle: false, title: 'Processus', collapsible: true, expanded: false, reorderable: true }, {}, intl);
        const row = rows()[0];
        expect(row.querySelector('.list-field__item-header')).not.toBeNull();
        expect(row.querySelector('.list-field__title')).toBeNull();
        expect(row.textContent).not.toContain('Processus');
        const toggle = row.querySelector('.list-field__toggle') as HTMLButtonElement;
        expect(toggle.getAttribute('aria-label')).toBe('Processus 1');
        expect(row.querySelector('.list-field__delete')!.getAttribute('aria-label')).toBe('Supprimer Processus 1');
        expect(row.querySelector('.list-field__drag')).not.toBeNull();
        list.formArray.at(0).get('value')!.setErrors({ invalid: true });
        await render();
        expect(row.querySelector('.list-field__invalid')).not.toBeNull();
        const body = row.querySelector('.list-field__fields') as HTMLElement;
        expect(body.hidden).toBeTrue();
        toggle.click();
        await render();
        expect(body.hidden).toBeFalse();
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('uses translated fallbacks instead of technical IDs, objects, or empty titles', () => {
        const intl = new KlesDynamicFormIntl();
        intl.listFieldItem = (index) => 'Élément ' + (index + 1);
        intl.listFieldDelete = (title) => 'Supprimer ' + title;
        create({ showHeader: true }, {
            value: [{ label: { id: 42 }, _id: 'secret-identifier' }, { label: '  ' }, { label: '[object Object]' }],
        }, intl);
        const titles = rows().map((row) => row.querySelector('.list-field__title')!.textContent!.trim());
        expect(titles).toEqual(['Élément 1', 'Élément 2', 'Élément 3']);
        expect(fixture.nativeElement.textContent).not.toContain('secret-identifier');
        expect(rows()[0].querySelector('.list-field__delete')!.getAttribute('aria-label')).toBe('Supprimer Élément 1');
    });

    it('numbers configured titles through Intl and renumbers them after deletion and reordering', async () => {
        const intl = new KlesDynamicFormIntl();
        intl.listFieldItem = (index, title = 'Élément') => title + ' n°' + (index + 1);
        intl.listFieldDelete = (title) => 'Supprimer ' + title;
        create({ title: 'Processus', titleField: 'value', reorderable: true }, {}, intl);
        const titles = () => rows().map((row) => row.querySelector('.list-field__title')!.textContent!.trim());
        expect(titles()).toEqual(['Processus n°1', 'Processus n°2', 'Processus n°3']);
        const group = list.formArray.at(0);
        group.get('label')!.setValue('Must not become the title');
        list.moveField(0, 2);
        await render();
        expect(list.formArray.at(2)).toBe(group);
        expect(titles()).toEqual(['Processus n°1', 'Processus n°2', 'Processus n°3']);
        list.deleteField(0);
        await render();
        expect(titles()).toEqual(['Processus n°1', 'Processus n°2']);
        list.addField();
        await render();
        expect(titles()).toEqual(['Processus n°1', 'Processus n°2', 'Processus n°3']);
        expect(rows()[2].querySelector('.list-field__delete')!.getAttribute('aria-label')).toBe('Supprimer Processus n°3');
    });

    it('uses the translated fallback for a blank configured title without consulting row data', async () => {
        const intl = new KlesDynamicFormIntl();
        intl.listFieldItem = (index, title = 'Élément') => title + ' ' + (index + 1);
        create({ title: '   ' }, {}, intl);
        // Enable the header separately because a blank title alone is not useful.
        list.field.listFieldOptions = { title: '   ', showHeader: true };
        await render();
        expect(rows()[0].querySelector('.list-field__title')!.textContent).toBe('Élément 1');
        expect(fixture.nativeElement.textContent).not.toContain('[object Object]');
    });

    it('resolves titles from a control or function and updates them when values change', async () => {
        create({ titleField: 'value' }, { value: [{ value: 'From field' }] });
        expect(rows()[0].querySelector('.list-field__title')!.textContent).toContain('From field');
        list.formArray.at(0).get('value')!.setValue('Changed');
        await render();
        expect(rows()[0].querySelector('.list-field__title')!.textContent).toContain('Changed');
        list.field.listFieldOptions = { title: ({ value, index }) => String(value.label) + ' ' + (index + 1) };
        list.formArray.at(0).get('label')!.setValue('From function');
        await render();
        expect(rows()[0].querySelector('.list-field__title')!.textContent).toContain('From function 1');
    });

    it('collapses without rebuilding fields or changing controls, values, validation, or UI state', async () => {
        create({ collapsible: true });
        const group = list.formArray.at(0);
        const control = group.get('value')!;
        control.setValue('keep');
        control.addValidators(Validators.required);
        control.markAsDirty();
        control.markAsTouched();
        const ui = list.getRowUi(0);
        const input = rows()[0].querySelector('input');
        const toggle = rows()[0].querySelector('.list-field__toggle') as HTMLButtonElement;
        toggle.click();
        await render();
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        const body = rows()[0].querySelector('.list-field__fields') as HTMLElement;
        expect(body.hidden).toBeTrue();
        expect(getComputedStyle(body).display).toBe('none');
        expect(body.id).toBe(toggle.getAttribute('aria-controls')!);
        expect(body.getAttribute('aria-labelledby')).toBe(toggle.id);
        expect(group.get('value')).toBe(control);
        expect(control.value).toBe('keep');
        expect(control.dirty && control.touched && control.enabled).toBeTrue();
        expect(control.hasValidator(Validators.required)).toBeTrue();
        expect(list.getRowUi(0)).toBe(ui);
        toggle.click();
        await render();
        expect(rows()[0].querySelector('input')).toBe(input);
        expect(body.hidden).toBeFalse();
    });

    it('reports sync and async validation errors in a collapsed header', async () => {
        create({ collapsible: true, expanded: false });
        const control = list.formArray.at(0).get('value')!;
        control.addValidators(Validators.required);
        control.updateValueAndValidity();
        await render();
        expect(rows()[0].querySelector('.list-field__invalid')!.getAttribute('aria-label')).toBe(list.intl.listFieldInvalid);
        control.setValue('valid');
        await render();
        expect(rows()[0].querySelector('.list-field__invalid')).toBeNull();
        control.setAsyncValidators(() => Promise.resolve({ server: true }));
        control.updateValueAndValidity();
        await render();
        expect(rows()[0].querySelector('.list-field__invalid')).not.toBeNull();
        expect((rows()[0].querySelector('.list-field__fields') as HTMLElement).hidden).toBeTrue();
    });

    it('enforces minimum and maximum in both commands and public methods', async () => {
        create({ minItems: 2, maxItems: 3 });
        expect((fixture.nativeElement.querySelector('.list-field__add') as HTMLButtonElement).disabled).toBeTrue();
        list.addField();
        expect(list.formArray.length).toBe(3);
        list.deleteField(0);
        await render();
        expect(list.formArray.length).toBe(2);
        expect((rows()[0].querySelector('.list-field__delete') as HTMLButtonElement).disabled).toBeTrue();
        list.deleteField(0);
        list.deleteField(-1);
        list.deleteField(2);
        expect(list.formArray.length).toBe(2);
        list.addField();
        await render();
        expect(list.formArray.length).toBe(3);
        expect(list.subUi.states.length).toBe(3);
        expect(list.collections().length).toBe(3);
    });

    it('validates preloaded counts including an empty array and preserves custom validators', () => {
        create({ minItems: 1, maxItems: 2 }, {
            value: [],
            validations: [{ name: 'custom', validator: () => ({ custom: true }), message: 'Custom error' }],
        });
        expect(list.formArray.errors).toEqual({ custom: true, listMinItems: { required: 1, actual: 0 } });
        expect(fixture.nativeElement.textContent).toContain(list.intl.listFieldMinItems(1));
        list.addField();
        expect(list.formArray.errors).toEqual({ custom: true });
    });

    it('validates an excessive initial count without deleting data', () => {
        create({ maxItems: 1 });
        expect(list.formArray.errors).toEqual({ listMaxItems: { required: 1, actual: 3 } });
        expect(list.formArray.length).toBe(3);
        expect(list.canAdd).toBeFalse();
        expect(fixture.nativeElement.textContent).toContain(list.intl.listFieldMaxItems(1));
        list.deleteField(2);
        list.deleteField(1);
        expect(list.formArray.valid).toBeTrue();
    });

    it('supports zero as a maximum and rejects modification through every entry point', () => {
        create({ maxItems: 0, reorderable: true }, { value: [] });
        list.addField();
        list.deleteField(0);
        list.moveField(0, 1);
        expect(list.formArray.length).toBe(0);
        expect(list.formArray.valid).toBeTrue();
        expect(list.canAdd).toBeFalse();
    });

    it('rejects add, delete, drag, and keyboard reorder while disabled and supports runtime enabling', async () => {
        create({ reorderable: true });
        const groups = [...list.formArray.controls];
        list.formArray.disable();
        await render();
        list.addField();
        list.deleteField(0);
        list.moveField(0, 1);
        const dropList = fixture.debugElement.query(By.directive(CdkDropList)).injector.get(CdkDropList);
        list.drop({ previousContainer: dropList, container: dropList, previousIndex: 0, currentIndex: 1 } as CdkDragDrop<any>);
        expect(list.formArray.controls).toEqual(groups);
        expect(Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).every((button) => button.disabled)).toBeTrue();
        expect(dropList.disabled).toBeTrue();
        expect(fixture.debugElement.queryAll(By.directive(CdkDrag)).every((el) => el.injector.get(CdkDrag).disabled)).toBeTrue();
        list.formArray.enable();
        await render();
        list.moveField(0, 1);
        expect(list.formArray.at(1)).toBe(groups[0]);
    });

    it('also respects the initial disabled configuration', () => {
        create({ reorderable: true }, { disabled: true });
        list.addField();
        list.deleteField(0);
        list.moveField(0, 2);
        expect(list.formArray.length).toBe(3);
        expect(list.formArray.disabled).toBeTrue();
        expect(list.canAdd).toBeFalse();
        expect(list.canDelete(0)).toBeFalse();
    });

    it('moves controls, UI, field configurations, IDs, validators and dirty/touched states together', async () => {
        create({ reorderable: true, collapsible: true });
        const group = list.formArray.at(0);
        const id = group.get('_id')!.value;
        const control = group.get('value')!;
        control.addValidators(Validators.required);
        control.markAsDirty();
        control.markAsTouched();
        control.updateValueAndValidity();
        const ui = list.getRowUi(0);
        const fields = list.collections()[0];
        (rows()[0].querySelector('.list-field__toggle') as HTMLButtonElement).click();
        await render();
        const values = jasmine.createSpy('values');
        list.formArray.valueChanges.subscribe(values);
        const dropList = fixture.debugElement.query(By.directive(CdkDropList)).injector.get(CdkDropList);
        list.drop({ previousContainer: dropList, container: dropList, previousIndex: 0, currentIndex: 2 } as CdkDragDrop<any>);
        await render();
        expect(values).toHaveBeenCalledTimes(1);
        expect(list.formArray.at(2)).toBe(group);
        expect(group.get('_id')!.value).toBe(id);
        expect(group.get('value')).toBe(control);
        expect(control.dirty && control.touched && control.invalid).toBeTrue();
        expect(control.hasValidator(Validators.required)).toBeTrue();
        expect(list.getRowUi(2)).toBe(ui);
        expect(list.collections()[2]).toBe(fields);
        expect((rows()[2].querySelector('.list-field__fields') as HTMLElement).hidden).toBeTrue();
        ui.get('value')!.patchValue({ appearance: 'outline' });
        expect(list.subUi.value()![2].value.appearance).toBe('outline');
        expect(announce).toHaveBeenCalledWith(list.intl.listFieldMoved('First', 3, 3));
    });

    it('supports keyboard reordering with focus retained on the moved handle', async () => {
        create({ reorderable: true });
        const group = list.formArray.at(0);
        const handle = rows()[0].querySelector('.list-field__drag') as HTMLButtonElement;
        handle.focus();
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        await render();
        expect(list.formArray.at(1)).toBe(group);
        expect(document.activeElement).toBe(rows()[1].querySelector('.list-field__drag'));
        expect((rows()[0].querySelector('.list-field__move-up') as HTMLButtonElement).disabled).toBeTrue();
        expect((rows()[2].querySelector('.list-field__move-down') as HTMLButtonElement).disabled).toBeTrue();
        list.moveField(-1, 0);
        list.moveField(0, 3);
        expect(list.formArray.at(1)).toBe(group);
    });

    it('keeps in-flight child validation and individually disabled controls during a move', async () => {
        create({ reorderable: true, showHeader: true });
        const group = list.formArray.at(0);
        const control = group.get('value')!;
        const validator = jasmine.createSpy('asyncValidator').and.returnValue(Promise.resolve({ remote: true }));
        control.setAsyncValidators(validator);
        control.updateValueAndValidity();
        group.get('label')!.disable();
        expect(control.pending).toBeTrue();
        list.moveField(0, 2);
        expect(list.formArray.at(2)).toBe(group);
        expect(control.pending).toBeTrue();
        await render();
        expect(validator).toHaveBeenCalledTimes(1);
        expect(control.hasError('remote')).toBeTrue();
        expect(group.get('label')!.disabled).toBeTrue();
        expect(rows()[2].querySelector('.list-field__invalid')).not.toBeNull();
    });

    it('opens a new row and focuses its first visible editable field', async () => {
        create({ collapsible: true, expanded: false }, {
            collections: [
                { name: 'hidden', component: KlesFormInputComponent, visible: false },
                { name: 'locked', component: KlesFormInputComponent, disabled: true },
                { name: 'preview', component: KlesFormButtonComponent, label: 'Preview' },
                { name: 'label', component: KlesFormInputComponent },
            ],
        });
        list.addField();
        await render();
        const row = rows()[3];
        expect((row.querySelector('.list-field__fields') as HTMLElement).hidden).toBeFalse();
        const inputs = row.querySelectorAll('input');
        expect(inputs.length).toBe(2);
        expect(inputs[0].disabled).toBeTrue();
        expect(document.activeElement).toBe(inputs[1]);
    });

    it('restores focus to a remaining command or the add button after deletion', async () => {
        create();
        (rows()[0].querySelector('.list-field__delete') as HTMLButtonElement).click();
        await render();
        expect(document.activeElement).toBe(rows()[0].querySelector('.list-field__delete'));
        list.deleteField(1);
        list.deleteField(0);
        await render();
        expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.list-field__add'));
        expect(fixture.nativeElement.querySelector('.list-field__empty')!.textContent).toContain(list.intl.empty);
        expect(list.formArray.length).toBe(0);
        expect(list.subUi.states.length).toBe(0);
        expect(list.collections().length).toBe(0);
    });

    it('allows translated command and empty-state text overrides', () => {
        create({ labels: { add: 'Ajouter un processus', empty: 'Aucun processus', item: (index) => 'Processus ' + (index + 1) } }, { value: [] });
        expect(fixture.nativeElement.querySelector('.list-field__add')!.textContent).toContain('Ajouter un processus');
        expect(fixture.nativeElement.querySelector('.list-field__empty')!.textContent).toBe('Aucun processus');
    });

    it('keeps a collapsed summary and deletion aligned in a narrow panel, with a leading chevron and centered error', async () => {
        create({ title: 'Processus', collapsible: true, expanded: false });
        fixture.nativeElement.style.display = 'block';
        fixture.nativeElement.style.width = '280px';
        list.formArray.at(0).get('value')!.setErrors({ invalid: true });
        await render();
        const row = rows()[0];
        const toggle = row.querySelector('.list-field__toggle') as HTMLElement;
        const deletion = row.querySelector('.list-field__delete') as HTMLElement;
        const title = row.querySelector('.list-field__title') as HTMLElement;
        const error = row.querySelector('.list-field__invalid') as HTMLElement;
        const chevron = row.querySelector('.list-field__chevron') as HTMLElement;
        const center = (element: HTMLElement) => {
            const rect = element.getBoundingClientRect();
            return rect.top + rect.height / 2;
        };
        expect(Math.abs(center(toggle) - center(deletion))).toBeLessThan(2);
        expect(Math.abs(center(title) - center(error))).toBeLessThan(2);
        expect(chevron.getBoundingClientRect().right).toBeLessThanOrEqual(title.getBoundingClientRect().left);
        expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
        expect((row.querySelector('.list-field__fields') as HTMLElement).hidden).toBeTrue();
    });

    it('stacks explicit grid fields by default inside a narrow component, independently of viewport width', async () => {
        create({ showHeader: true, reorderable: true, presentation: 'outlined', itemPadding: '12px' }, {
            collections: [
                { name: 'label', component: KlesFormInputComponent, layout: { colStart: 1, colSpan: 4 } },
                { name: 'value', component: KlesFormInputComponent, layout: { colStart: 5, colSpan: 8 } },
            ],
        });
        fixture.nativeElement.style.display = 'block';
        fixture.nativeElement.style.width = '280px';
        await render();
        const row = rows()[0];
        const fields = row.querySelector('.list-field__fields') as HTMLElement;
        const children = row.querySelectorAll('.list-field__field') as NodeListOf<HTMLElement>;
        expect(window.innerWidth).toBeGreaterThan(480);
        expect(getComputedStyle(fields).flexDirection).toBe('column');
        expect(children[1].getBoundingClientRect().top).toBeGreaterThanOrEqual(children[0].getBoundingClientRect().bottom);
        expect(fields.getBoundingClientRect().width).toBeGreaterThan(row.getBoundingClientRect().width - 30);
        expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
        fixture.nativeElement.style.width = '800px';
        await render();
        expect(getComputedStyle(fields).display).toBe('grid');
    });

    it('keeps the configured grid in narrow panels when responsive is explicitly false', async () => {
        create({ responsive: false }, {
            collections: [
                { name: 'label', component: KlesFormInputComponent, layout: { colStart: 1, colSpan: 4 } },
                { name: 'value', component: KlesFormInputComponent, layout: { colStart: 5, colSpan: 8 } },
            ],
        });
        fixture.nativeElement.style.display = 'block';
        fixture.nativeElement.style.width = '280px';
        await render();
        const fields = rows()[0].querySelector('.list-field__fields') as HTMLElement;
        const children = fields.querySelectorAll('.list-field__field') as NodeListOf<HTMLElement>;
        expect(getComputedStyle(fields).display).toBe('grid');
        expect(children[0].getBoundingClientRect().top).toBe(children[1].getBoundingClientRect().top);
    });

    it('uses Material theme colors and configurable spacing for the optional outlined presentation', async () => {
        create({ presentation: 'outlined', itemPadding: '20px', density: 'compact' });
        const host = fixture.nativeElement.querySelector('kles-form-listfield') as HTMLElement;
        host.style.setProperty('--mat-sys-outline-variant', 'rgb(50, 60, 70)');
        host.style.setProperty('--kles-list-field-item-gap', '24px');
        await render();
        expect(getComputedStyle(rows()[0]).borderTopColor).toBe('rgb(50, 60, 70)');
        expect(getComputedStyle(rows()[0]).paddingTop).toBe('20px');
        expect(getComputedStyle(fixture.nativeElement.querySelector('.list-field__content')).gap).toBe('24px');
        host.style.setProperty('--mat-sys-outline-variant', 'rgb(160, 170, 180)');
        expect(getComputedStyle(rows()[0]).borderTopColor).toBe('rgb(160, 170, 180)');
    });
});
