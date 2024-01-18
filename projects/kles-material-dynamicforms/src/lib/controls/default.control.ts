import { AbstractControl, FormControl, ValidatorFn, Validators, AsyncValidatorFn } from "@angular/forms";
import { concat, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { IKlesFieldConfig } from "../interfaces/field.config.interface";
import { IKlesValidator } from "../interfaces/validator.interface";
import { IKlesControl } from "./control.interface";

export class KlesFormControl implements IKlesControl {

    constructor(protected field: IKlesFieldConfig) {
    }

    public create(): AbstractControl {
        const control = new FormControl(
            this.field.value,
            {
                nonNullable: this.field.nonNullable || false,
                validators: this.bindValidations(this.field.validations || []),
                asyncValidators: this.bindAsyncValidations(this.field.asyncValidations || []),
                updateOn: this.field.updateOn || 'change'
            }
        );

        if (this.field.disabled) {
            control.disable();
        }

        if (this.field.asyncValue) {
            concat(
                of({ value: null, pending: true }),
                this.field.asyncValue.pipe(
                    take(1),
                    catchError((err) => {
                        console.error(err);
                        return of(null);
                    }),
                    map((value) => ({ value, pending: false }))
                )
            ).subscribe((response) => {
                this.field.pending = response.pending;
                if (response.pending) {
                    control.disable({ emitEvent: false });
                } else {
                    if (!this.field.disabled) {
                        control.enable({ emitEvent: false });
                    }
                    control.setValue(response.value);
                    this.field.value = response.value;
                }
            });
        }

        return control;
    }

    public bindValidations(validations: IKlesValidator<ValidatorFn>[]): ValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);

        }
        return null;
    }

    public bindAsyncValidations(validations: IKlesValidator<AsyncValidatorFn>[]): AsyncValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.composeAsync(validList);

        }
        return null;
    }
}
