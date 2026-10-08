import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KlesDynamicFormComponent } from '../dynamic-form.component';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFormInputComponent } from './input.component';
import { KlesFormListFieldComponent } from './list-field.component';

describe('KlesFormListFieldComponent appearance', () => {
    it('preserves collection appearance for existing and added rows', () => {
        const field: IKlesFieldConfig = {
            name: 'items',
            component: KlesFormListFieldComponent,
            collections: [
                { name: 'outlined', component: KlesFormInputComponent, appearance: 'outline' },
                { name: 'filled', component: KlesFormInputComponent },
            ],
        };
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, NoopAnimationsModule],
        });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [field]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-outline').length).toBe(1);
        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-fill').length).toBe(1);

        const list = fixture.debugElement.query(By.directive(KlesFormListFieldComponent)).componentInstance as KlesFormListFieldComponent;
        list.addField();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-outline').length).toBe(2);
        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-fill').length).toBe(2);

        list.getRowUi(1).get('outlined')!.patchValue({ appearance: 'fill' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-outline').length).toBe(1);

        const remainingUi = list.getRowUi(1);
        list.deleteField(0);
        fixture.detectChanges();
        expect(list.getRowUi(0)).toBe(remainingUi);
        expect(list.subUi.states.length).toBe(1);
        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-outline').length).toBe(0);
        expect(fixture.nativeElement.querySelectorAll('.mat-form-field-appearance-fill').length).toBe(2);
    });
});

describe('KlesFormListFieldComponent error layout', () => {
    function createList(collections: IKlesFieldConfig[], validations?: IKlesFieldConfig['validations']) {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, NoopAnimationsModule],
        });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [{ name: 'items', component: KlesFormListFieldComponent, collections, validations }]);
        fixture.detectChanges();
        const list = fixture.debugElement.query(By.directive(KlesFormListFieldComponent)).componentInstance as KlesFormListFieldComponent;
        return { fixture, list };
    }

    it('sizes child errors dynamically in existing and added rows while preserving explicit sizing', () => {
        const collections: IKlesFieldConfig[] = [
            { name: 'automatic', component: KlesFormInputComponent },
            { name: 'fixed', component: KlesFormInputComponent, subscriptSizing: 'fixed' },
        ];
        const { fixture, list } = createList(collections);
        list.addField();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.mat-mdc-form-field-subscript-dynamic-size').length).toBe(2);
        expect(list.collections().every((row) => row[1].subscriptSizing === 'fixed')).toBeTrue();
        expect(collections[0].subscriptSizing).toBeUndefined();
    });

    it('hides the array error container when empty and restores it only for a displayed message', async () => {
        const message = 'La liste doit contenir au moins deux éléments.';
        const { fixture, list } = createList(
            [{ name: 'value', component: KlesFormInputComponent }],
            [{ name: 'minimum', validator: () => null, message }],
        );
        await fixture.whenStable();
        fixture.detectChanges();
        const errors = fixture.nativeElement.querySelector('.list-field__errors') as HTMLElement;
        expect(getComputedStyle(errors).display).toBe('none');

        list.formArray.setErrors({ minimum: true });
        fixture.detectChanges();
        expect(errors.textContent).toContain(message);
        expect(getComputedStyle(errors).display).toBe('flex');

        list.formArray.setErrors({ withoutMessage: true });
        fixture.detectChanges();
        expect(getComputedStyle(errors).display).toBe('none');

        list.formArray.setErrors(null);
        fixture.detectChanges();
        expect(getComputedStyle(errors).display).toBe('none');
    });

    it('keeps the next row below a multiline child validation message', async () => {
        const message = 'Saisissez un identifiant non vide de 256 caractères maximum, sans caractères de contrôle. '.repeat(4);
        const { fixture, list } = createList([
            { name: 'value', component: KlesFormInputComponent, validations: [{ name: 'invalid', validator: () => null, message }] },
        ]);
        fixture.nativeElement.style.display = 'block';
        fixture.nativeElement.style.width = '280px';
        list.addField();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const rows = fixture.nativeElement.querySelectorAll('.list-field__row') as NodeListOf<HTMLElement>;
        const originalHeight = rows[0].getBoundingClientRect().height;
        const control = list.formArray.at(0).get('value')!;
        control.markAsTouched();
        control.setErrors({ invalid: true });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const error = rows[0].querySelector('mat-error') as HTMLElement;
        expect(error.textContent).toContain(message.trim());
        expect(rows[0].getBoundingClientRect().height).toBeGreaterThan(originalHeight);
        expect(rows[1].getBoundingClientRect().top).toBeGreaterThanOrEqual(error.getBoundingClientRect().bottom);
    });
});