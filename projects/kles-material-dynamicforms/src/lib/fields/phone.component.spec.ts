import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EnumType } from '../enums/type.enum';
import { KlesDynamicFormComponent } from '../dynamic-form.component';
import { KlesFormPhoneComponent } from './phone.component';
import { KlesPhoneControlComponent } from '../forms/phone-control.component';

describe('KlesFormPhoneComponent', () => {
    it('maps EnumType.phone and displays its validation error in dynamic forms', () => {
        TestBed.configureTestingModule({ imports: [KlesDynamicFormComponent, KlesFormPhoneComponent] });
        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [{ type: EnumType.phone, name: 'phone', value: '+33612345678', phoneOptions: { invalidMessage: 'Invalid number' } }]);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.directive(KlesFormPhoneComponent))).toBeTruthy();
        const phone = fixture.debugElement.query(By.directive(KlesPhoneControlComponent)).componentInstance as KlesPhoneControlComponent;
        expect(phone.value).toBe('+33612345678');
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        input.value = '123';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Invalid number');
        fixture.destroy();
    });
});
