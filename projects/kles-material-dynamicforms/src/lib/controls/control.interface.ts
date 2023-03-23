import { AbstractControl, AsyncValidatorFn, ValidatorFn } from "@angular/forms";
import { IKlesValidator } from "../interfaces/validator.interface";

export interface IKlesControl {
    create(): AbstractControl;
    bindValidations(validations: IKlesValidator<ValidatorFn>[]): ValidatorFn;
    bindAsyncValidations(validations: IKlesValidator<AsyncValidatorFn>[]): AsyncValidatorFn;
}
