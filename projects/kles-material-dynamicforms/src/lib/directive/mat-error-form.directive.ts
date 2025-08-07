import { Component, Input } from "@angular/core";
import { IKlesValidator } from "../interfaces/validator.interface";
import { AsyncValidator, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    selector: '[matErrorForm]',
    template: `
      @if(form && form.errors){
        @for (validation of validations; track validation.name) {
            @if (form?.hasError(validation.name) && validation.message) {
                {{validation.message}}
            }
        }
        @for (validation of asyncValidations; track validation.name) {
            @if (form?.hasError(validation.name) && validation.message) {
                {{validation.message}}
            }
        }
      }
    `,
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule
    ],
})
export class MatErrorFormDirective {
  @Input({ required: false }) validations: IKlesValidator<Validators>[] = [];
  @Input({ required: false }) asyncValidations: IKlesValidator<AsyncValidator>[] = [];
  @Input({ required: true }) form: UntypedFormGroup;
}
