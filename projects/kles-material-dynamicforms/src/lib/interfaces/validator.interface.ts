import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';


export interface IKlesValidator<T> {
    name: string;
    validator: T;
    message: string;
    messageKey?: string
}
