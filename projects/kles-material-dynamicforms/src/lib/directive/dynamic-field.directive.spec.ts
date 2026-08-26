import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KlesDynamicFormComponent } from '../dynamic-form.component';
import { EnumType } from '../enums/type.enum';
import { KlesFormPasswordVisibilityComponent } from '../fields/subfields/password-visibility.component';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

describe('KlesDynamicFieldDirective', () => {
    it('rebuilds projected subcomponents when fields change', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        const passwordField = (label: string): IKlesFieldConfig => ({
            type: EnumType.input,
            name: 'apiKey',
            label,
            inputType: 'password',
            subComponents: [KlesFormPasswordVisibilityComponent],
        });

        fixture.componentRef.setInput('fields', [passwordField('API key')]);
        fixture.detectChanges();

        fixture.componentRef.setInput('fields', [passwordField('Updated API key')]);

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.nativeElement.querySelectorAll('kles-form-password-visibility').length).toBe(1);

        fixture.nativeElement.querySelector('kles-form-password-visibility button').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('kles-form-password-visibility mat-icon').textContent.trim()).toBe('visibility');
        expect(() => fixture.destroy()).not.toThrow();
    });
});
