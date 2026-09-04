import { AfterViewInit, Component, computed, inject, input, signal } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, startWith, switchMap } from 'rxjs';

import { IKlesValidator } from '../interfaces/validator.interface';
import { flattenValidators } from '../utils/validation.util';

@Component({
    selector: '[matErrorMessage]',
    template: `
        @if (errors(); as errors) {
            @for (validation of validationsKeys(); track validation.name) {
                @if (errors[validation.name] && validation.message) {
                    {{ validation.message }}
                }
            }

            @for (validation of asyncValidationsKeys(); track validation.name) {
                @if (errors[validation.name] && validation.message) {
                    {{ validation.message }}
                }
            }
        }
    `,
    standalone: true,
    styles: [
        `
            :host {
                overflow-wrap: break-word;
            }
        `,
    ],
})
export class MatErrorMessageDirective implements AfterViewInit {
    readonly validations = input<IKlesValidator<ValidatorFn>[] | undefined>();

    readonly asyncValidations = input<IKlesValidator<AsyncValidatorFn>[] | undefined>();

    readonly validationsKeys = computed(() => flattenValidators<ValidatorFn>(this.validations() ?? []));

    readonly asyncValidationsKeys = computed(() => flattenValidators<AsyncValidatorFn>(this.asyncValidations() ?? []));

    private readonly formField = inject(MatFormField);

    private readonly inputRef = signal<MatFormFieldControl<unknown> | undefined>(undefined);

    private readonly controlStatus = toSignal(
        toObservable(this.inputRef).pipe(
            switchMap((control) => {
                const ngControl = control?.ngControl;

                if (!ngControl) {
                    return of(null);
                }

                return ngControl.statusChanges?.pipe(startWith(ngControl.status)) ?? of(ngControl.status);
            }),
        ),
        {
            initialValue: null,
        },
    );

    readonly errors = computed(() => {
        // Force la dépendance réactive aux changements de statut
        // du FormControl.
        this.controlStatus();

        return this.inputRef()?.ngControl?.errors ?? null;
    });

    ngAfterViewInit(): void {
        this.inputRef.set(this.formField._control);
    }
}
