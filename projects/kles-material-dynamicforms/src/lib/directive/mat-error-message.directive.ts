import { Component, AfterViewInit, Injector, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatFormFieldControl, MatFormField } from '@angular/material/form-field';
import { IKlesValidator, KlesValidationKey } from '../interfaces/validator.interface';
import { AsyncValidator, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { flattenValidators } from '../utils/validation.util';

@Component({
    selector: '[matErrorMessage]',
    template: `
        @for (validation of validationsKeys; track validation.name) {
            @if (inputRef?.ngControl.hasError(validation.name) && validation.message) {
                {{ validation.message }}
            }
        }
        @for (validation of asyncValidationsKeys; track validation.name) {
            @if (inputRef?.ngControl.hasError(validation.name) && validation.message) {
                {{ validation.message }}
            }
        }
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule],
})
export class MatErrorMessageDirective implements AfterViewInit {
    validationsKeys: KlesValidationKey[] = [];
    asyncValidationsKeys: KlesValidationKey[] = [];

    @Input()
    set validations(v: IKlesValidator<Validators>[]) {
        this.validationsKeys = flattenValidators<Validators>(v ?? []);
    }

    @Input()
    set asyncValidations(v: IKlesValidator<AsyncValidator>[]) {
        this.asyncValidationsKeys = flattenValidators<AsyncValidator>(v ?? []);
    }

    inputRef: MatFormFieldControl<MatFormFieldControl<any>>;

    constructor(private _inj: Injector) {}

    ngAfterViewInit() {
        let container = this._inj.get(MatFormField, null, { optional: true });
        this.inputRef = container?._control;
    }
}
