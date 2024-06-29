import { Component, Input } from "@angular/core";
import { IKlesValidator } from "../interfaces/validator.interface";
import { AsyncValidator, UntypedFormGroup, Validators } from "@angular/forms";

@Component({
  selector: '[matErrorForm]',
  template: `
        @for (validation of validations; track validation.name) {
            @if (form?.hasError(validation.name) && validation.message) {
                {{validation.message | translate}}
            }
        }
        @for (validation of asyncValidations; track validation.name) {
            @if (form?.hasError(validation.name) && validation.message) {
                {{validation.message | translate}}
            }
        }
    `
})
export class MatErrorFormDirective {
  @Input({ required: false }) validations: IKlesValidator<Validators>[] = [];
  @Input({ required: false }) asyncValidations: IKlesValidator<AsyncValidator>[] = [];
  @Input({ required: true }) form: UntypedFormGroup;
}
