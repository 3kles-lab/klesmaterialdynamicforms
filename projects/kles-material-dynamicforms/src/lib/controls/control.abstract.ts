import { AbstractControl, ValidatorFn, AsyncValidatorFn, Validators } from "@angular/forms";
import { IKlesValidator } from "../interfaces/validator.interface";
import { IKlesFieldConfig } from "../interfaces/field.config.interface";
import { IKlesControl } from "./control.interface";
import { ChangeDetectorRef } from "@angular/core";
import { tap } from "rxjs/operators";


export abstract class KlesAbstractFormControl implements IKlesControl {

    constructor(protected field: IKlesFieldConfig, protected ref?: ChangeDetectorRef) {

    }
    abstract create(): AbstractControl;

    public bindValidations(validations: IKlesValidator<ValidatorFn>[]): ValidatorFn {
        if (validations.length > 0) {
            return Validators.compose(validations.map((validation) => validation.validator));

        }
        return null;
    }

    public bindAsyncValidations(validations: IKlesValidator<AsyncValidatorFn>[]): AsyncValidatorFn {
        if (validations.length > 0) {
            return Validators.composeAsync(validations.map((validation) => {
                return ((c: AbstractControl) => {
                    const validator$ = validation.validator(c);
                    if (validator$ instanceof Promise) {
                        return validator$.finally(() => this.ref?.markForCheck());
                    } else {
                        return validator$.pipe(tap(() => this.ref?.markForCheck()));
                    }
                });
            }));
        }
        return null;
    }

}