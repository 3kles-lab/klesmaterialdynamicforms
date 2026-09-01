import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IKlesValidator, KlesValidationKey } from '../interfaces/validator.interface';
import { AsyncValidator, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';

import { flattenValidators } from '../utils/validation.util';

@Component({
    selector: '[matErrorForm]',
    template: `
        @if (form && form.errors) {
            @for (validation of validationsKeys; track validation.name) {
                @if (form?.hasError(validation.name) && validation.message) {
                    {{ validation.message }}
                }
            }
            @for (validation of asyncValidationsKeys; track validation.name) {
                @if (form?.hasError(validation.name) && validation.message) {
                    {{ validation.message }}
                }
            }
        }
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, FormsModule],
})
export class MatErrorFormDirective {
    validationsKeys: KlesValidationKey[] = [];
    asyncValidationsKeys: KlesValidationKey[] = [];

    @Input({ required: true }) form: UntypedFormGroup;

    @Input()
    set validations(v: IKlesValidator<Validators>[]) {
        this.validationsKeys = flattenValidators<Validators>(v ?? []);
    }

    @Input()
    set asyncValidations(v: IKlesValidator<AsyncValidator>[]) {
        this.asyncValidationsKeys = flattenValidators<AsyncValidator>(v ?? []);
    }
}
