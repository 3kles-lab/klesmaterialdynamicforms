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
