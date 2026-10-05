import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { KlesPhoneControlComponent } from './phone-control.component';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, KlesPhoneControlComponent],
    template: `<mat-form-field><mat-label>Phone</mat-label>
        <kles-phone-control [formControl]="control" [options]="{ defaultCountry: 'FR', locale: 'fr-FR' }" />
        <mat-error>Invalid phone</mat-error></mat-form-field>`,
})
class PhoneHost {
    control = new FormControl<string | null>(null, Validators.required);
}

describe('KlesPhoneControlComponent', () => {
    let fixture: ComponentFixture<PhoneHost>;
    let component: KlesPhoneControlComponent;
    let control: FormControl<string | null>;
    let input: HTMLInputElement;
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [PhoneHost] });
        fixture = TestBed.createComponent(PhoneHost);
        fixture.detectChanges();
        component = fixture.debugElement.query(By.directive(KlesPhoneControlComponent)).componentInstance;
        control = fixture.componentInstance.control;
        input = fixture.nativeElement.querySelector('input');
    });
    afterEach(() => fixture.destroy());
    function enter(value: string): void {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }
    it('displays a compact country trigger while retaining full names in the dropdown', async () => {
        const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
        expect(await select.getValueText()).toBe('FR (+33)');
        await select.open();
        const options = await select.getOptions({ text: /^France \(\+33\)$/ });
        expect(options.length).toBe(1);
        await select.close();
    });
    it('adapts the empty input example to the country and honors a custom placeholder', () => {
        expect(input.placeholder).toBe('06 12 34 56 78');
        component.selectCountry('GB');
        fixture.detectChanges();
        expect(input.placeholder).toBe('07400 123456');
        expect(control.value).toBeNull();
        component.selectCountry('');
        fixture.detectChanges();
        expect(input.placeholder).toBe('+33 6 12 34 56 78');
        const custom = TestBed.createComponent(KlesPhoneControlComponent);
        custom.componentRef.setInput('placeholder', 'Votre numéro');
        custom.detectChanges();
        expect(custom.nativeElement.querySelector('input').placeholder).toBe('Votre numéro');
        custom.destroy();
    });
    it('normalizes French national input and preserves required validation', () => {
        expect(control.hasError('required')).toBeTrue();
        expect(input.required).toBeTrue();
        enter('06 12 34 56 78');
        expect(input.value).toBe('06 12 34 56 78');
        expect(control.value).toBe('+33612345678');
        expect(control.valid).toBeTrue();
    });
    it('detects pasted international numbers and supports 00 prefixes', () => {
        enter('+44 20 7946 0018');
        expect(component.country).toBe('GB');
        expect(control.value).toBe('+442079460018');
        enter('0041 44 668 18 00');
        expect(component.country).toBe('CH');
        expect(control.value).toBe('+41446681800');
    });
    it('preserves invalid input, reports phone errors and recovers', () => {
        enter('123');
        expect(control.value).toBe('123');
        expect(control.hasError('phone')).toBeTrue();
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        fixture.detectChanges();
        expect(control.touched).toBeTrue();
        expect(component.errorState).toBeTrue();
        enter('06 12 34 56 78');
        expect(control.hasError('phone')).toBeFalse();
        enter('');
        expect(control.value).toBeNull();
        expect(control.hasError('required')).toBeTrue();
        expect(control.hasError('phone')).toBeFalse();
    });
    it('filters letters and punctuation and rejects extensions', () => {
        enter('abc!?');
        expect(input.value).toBe('');
        expect(control.value).toBeNull();
        enter('06a12b34c56d78');
        expect(input.value).toBe('06 12 34 56 78');
        expect(control.value).toBe('+33612345678');
        enter('+33 6 12 34 56 78 ext. 123');
        expect(input.value).toBe('06 12 34 56 78');
        expect(control.value).toBe('+33612345678');
        control.setValue('+33 6 12 34 56 78 ext. 123');
        expect(control.hasError('phone')).toBeTrue();
    });
    it('updates from the model, disables both inputs and resets', () => {
        control.setValue('+442079460018');
        fixture.detectChanges();
        expect(component.country).toBe('GB');
        expect(input.value).toBe('020 7946 0018');
        control.disable();
        fixture.detectChanges();
        expect(input.disabled).toBeTrue();
        expect(fixture.debugElement.query(By.directive(MatSelect)).componentInstance.disabled).toBeTrue();
        control.enable();
        control.reset();
        fixture.detectChanges();
        expect(input.value).toBe('');
        expect(component.country).toBe('FR');
    });
    it('clears the number when selecting a different country in the Material overlay', async () => {
        enter('+1 202 555 0123');
        const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
        await select.open();
        expect(await select.isOpen()).toBeTrue();
        await select.clickOptions({ text: /Canada/ });
        expect(component.country).toBe('CA');
        expect(control.value).toBeNull();
        expect(input.value).toBe('');
        expect(control.hasError('required')).toBeTrue();
        expect(control.hasError('phone')).toBeFalse();
        enter('4165550123');
        expect(component.country).toBe('CA');
        expect(input.value).toBe('(416) 555-0123');
        expect(control.value).toBe('+14165550123');
    });
    it('clears incomplete input and keeps the new country through blur', () => {
        enter('0612');
        component.selectCountry('GB');
        fixture.detectChanges();
        expect(input.value).toBe('');
        expect(control.value).toBeNull();
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        fixture.detectChanges();
        expect(component.country).toBe('GB');
        enter('02079460018');
        expect(input.value).toBe('020 7946 0018');
        expect(control.value).toBe('+442079460018');
    });
    it('does not touch the composite control when focus moves between its inputs', () => {
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: fixture.nativeElement.querySelector('mat-select') }));
        expect(control.touched).toBeFalse();
    });
    it('commits input only on blur when requested by the parent control', () => {
        fixture.destroy();
        fixture = TestBed.createComponent(PhoneHost);
        fixture.componentInstance.control = new FormControl<string | null>(null, { updateOn: 'blur' });
        fixture.detectChanges();
        control = fixture.componentInstance.control;
        input = fixture.nativeElement.querySelector('input');
        enter('06 12 34 56 78');
        expect(control.value).toBeNull();
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        fixture.detectChanges();
        expect(control.value).toBe('+33612345678');
        expect(control.valid).toBeTrue();
    });
    it('accepts empty optional fields and keeps numbers outside the country selection international', () => {
        control.removeValidators(Validators.required);
        control.updateValueAndValidity();
        enter('');
        expect(control.valid).toBeTrue();
        component.options = { countries: ['FR'], locale: 'fr-FR' };
        component.ngOnChanges();
        enter('+44 20 7946 0018');
        expect(component.country).toBe('');
        expect(control.value).toBe('+442079460018');
        expect(control.valid).toBeTrue();
    });
    it('populates all countries when used without explicit options', () => {
        const standalone = TestBed.createComponent(KlesPhoneControlComponent);
        standalone.detectChanges();
        expect(standalone.componentInstance.countryOptions.length).toBeGreaterThan(200);
        standalone.destroy();
    });
    it('formats national digits progressively without waiting for blur', () => {
        enter('061');
        expect(input.value).toBe('06 1');
        enter('0612');
        expect(input.value).toBe('06 12');
        enter('061234');
        expect(input.value).toBe('06 12 34');
        expect(control.hasError('phone')).toBeTrue();
        enter('0612345678');
        expect(input.value).toBe('06 12 34 56 78');
        expect(control.valid).toBeTrue();
    });
    it('rejects digits exceeding the selected country numbering plan', () => {
        enter('0612345678');
        enter('06123456789');
        expect(input.value).toBe('06 12 34 56 78');
        expect(control.value).toBe('+33612345678');
    });
    it('preserves the cursor when editing in the middle of a formatted number', () => {
        enter('0612345678');
        input.value = '06 22 34 56 78';
        input.setSelectionRange(4, 4);
        input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: '2' }));
        fixture.detectChanges();
        expect(input.value).toBe('06 22 34 56 78');
        expect(input.selectionStart).toBe(4);
        expect(control.value).toBe('+33622345678');
    });
    it('lets backspace remove a digit across an automatically inserted separator', () => {
        enter('0612');
        input.value = '0612';
        input.setSelectionRange(2, 2);
        input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward' }));
        fixture.detectChanges();
        expect(input.value).toBe('01 2');
        expect(input.selectionStart).toBe(1);
    });
    it('lets forward delete remove a digit across an automatically inserted separator', () => {
        enter('0612');
        input.value = '0612';
        input.setSelectionRange(2, 2);
        input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentForward' }));
        fixture.detectChanges();
        expect(input.value).toBe('06 2');
        expect(input.selectionStart).toBe(2);
    });
});
