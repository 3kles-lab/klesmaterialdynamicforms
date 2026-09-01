import { Component, computed, input } from '@angular/core';
import { AsyncValidatorFn, FormsModule, ReactiveFormsModule, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { IKlesValidator } from '../interfaces/validator.interface';
import { flattenValidators } from '../utils/validation.util';

@Component({
    selector: '[matErrorForm]',
    template: `
        @if (form().errors) {
            @for (validation of validationsKeys(); track validation.name) {
                @if (form().hasError(validation.name) && validation.message) {
                    {{ validation.message }}
                }
            }

            @for (validation of asyncValidationsKeys(); track validation.name) {
                @if (form().hasError(validation.name) && validation.message) {
                    {{ validation.message }}
                }
            }
        }
    `,
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule],
})
export class MatErrorFormDirective {
    readonly form = input.required<UntypedFormGroup>();
    readonly validations = input<IKlesValidator<ValidatorFn>[]>();
    readonly asyncValidations = input<IKlesValidator<AsyncValidatorFn>[]>();
    readonly validationsKeys = computed(() => flattenValidators<ValidatorFn>(this.validations() ?? []));
    readonly asyncValidationsKeys = computed(() => flattenValidators<AsyncValidatorFn>(this.asyncValidations() ?? []));
}
