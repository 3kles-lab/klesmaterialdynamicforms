import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KlesDynamicFormComponent } from './dynamic-form.component';
import { KlesFormInputComponent } from './fields/input.component';
import { KlesFormGroupComponent } from './fields/group.component';
import { EnumType } from './enums/type.enum';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { KlesFormElement } from './interfaces/layout.interface';

describe('KlesDynamicFormComponent', () => {
    const input = (name: string, colSpan?: number): IKlesFieldConfig => ({
        name,
        component: KlesFormInputComponent,
        ...(colSpan == null ? {} : { layout: { colSpan } }),
    });

    const createGrid = (fields: KlesFormElement[]) => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, NoopAnimationsModule],
        });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('direction', 'grid');
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

    it('rebuilds the GroupUiState when the fields input changes', () => {
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

        expect(fixture.componentInstance.ui).not.toBe(initialUi);
        expect(fixture.componentInstance.ui.get('first')).toBeNull();
        expect(fixture.componentInstance.ui.get('second')?.value()?.appearance).toBe('outline');
        expect(fixture.componentInstance.form.get('first')).toBeNull();
        expect(fixture.componentInstance.form.get('second')).toBeInstanceOf(FormControl);
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
