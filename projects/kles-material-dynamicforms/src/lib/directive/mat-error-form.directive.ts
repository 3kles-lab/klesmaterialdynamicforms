import { Component, computed, input } from '@angular/core';
import { AsyncValidatorFn, FormsModule, ReactiveFormsModule, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, startWith, switchMap } from 'rxjs';

import { IKlesValidator } from '../interfaces/validator.interface';
import { flattenValidators } from '../utils/validation.util';

@Component({
    selector: '[matErrorForm]',
    template: `
        @if (formErrors()) {
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

    readonly validations = input<IKlesValidator<ValidatorFn>[]>([]);

    readonly asyncValidations = input<IKlesValidator<AsyncValidatorFn>[]>([]);

    readonly validationsKeys = computed(() => flattenValidators<ValidatorFn>(this.validations()));

    readonly asyncValidationsKeys = computed(() => flattenValidators<AsyncValidatorFn>(this.asyncValidations()));

    readonly formErrors = toSignal(
        toObservable(this.form).pipe(
            switchMap((form) =>
                form.statusChanges.pipe(
                    startWith(form.status),
                    map(() => form.errors),
                ),
            ),
        ),
        { initialValue: null },
    );
}
