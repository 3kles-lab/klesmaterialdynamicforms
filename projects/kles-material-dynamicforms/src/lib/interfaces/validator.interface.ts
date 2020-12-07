import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';


export interface IValidator<T> {
    name: string;
    validator: T;
    message: string;
}
