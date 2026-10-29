import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatErrorMessageDirective } from './mat-error-message.directive';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatErrorMessageDirective],
    template: `
        <mat-form-field>
            <input matInput [formControl]="control" />
            <mat-error matErrorMessage [validations]="validations" />
        </mat-form-field>
    `,
})
class ValidationHost {
    control = new FormControl('', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]);
    validations = [
        { name: 'required', validator: Validators.required, message: 'Required password' },
        { name: 'minlength', validator: Validators.minLength(12), message: 'Minimum 12 characters' },
        { name: 'maxlength', validator: Validators.maxLength(128), message: 'Maximum 128 characters' },
        { name: 'rejected', validator: () => null, message: 'Password rejected by server' },
    ];
}

describe('Dynamic field validation messages', () => {
    let fixture: ComponentFixture<ValidationHost>;
    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const message = () => fixture.nativeElement.querySelector('[matErrorMessage]')?.textContent ?? '';

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [ValidationHost, NoopAnimationsModule] }).compileComponents();
        fixture = TestBed.createComponent(ValidationHost);
        fixture.componentInstance.control.markAsTouched();
        await render();
    });

    afterEach(() => fixture.destroy());

    it('refreshes messages when validation errors change while the status stays INVALID', async () => {
        const control = fixture.componentInstance.control;
        expect(message()).toContain('Required password');
        control.setValue('short');
        await render();
        expect(control.status).toBe('INVALID');
        expect(message()).toContain('Minimum 12 characters');
        expect(message()).not.toContain('Required password');
        control.setValue('a'.repeat(129));
        await render();
        expect(control.status).toBe('INVALID');
        expect(message()).toContain('Maximum 128 characters');
        expect(message()).not.toContain('Minimum 12 characters');
    });

    it('shows errors supplied by the server while the control is already invalid', async () => {
        fixture.componentInstance.control.setErrors({ rejected: true });
        await render();
        expect(message()).toContain('Password rejected by server');
        expect(message()).not.toContain('Required password');
    });

    it('clears the old message after correction and shows the next error', async () => {
        fixture.componentInstance.control.setValue('A-strong-password-2026');
        await render();
        expect(message().trim()).toBe('');
        fixture.componentInstance.control.setValue('short');
        await render();
        expect(message()).toContain('Minimum 12 characters');
    });
});