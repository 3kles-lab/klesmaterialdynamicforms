import { Component, AfterViewInit, Injector, Input } from "@angular/core";
import { MatFormFieldControl, MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { IKlesValidator } from "../interfaces/validator.interface";
import { AsyncValidator, Validators } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    selector: '[matErrorMessage]',
    template: `
        @for (validation of validations; track validation.name) {
            @if (inputRef?.ngControl.hasError(validation.name) && validation.message) {
                {{validation.message}}
            }
        }
        @for (validation of asyncValidations; track validation.name) {
            @if (inputRef?.ngControl.hasError(validation.name) && validation.message) {
                {{validation.message}}
            }
        }
    `,
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
  ],
})
export class MatErrorMessageDirective implements AfterViewInit {
    @Input({ required: false }) validations: IKlesValidator<Validators>[] = [];
    @Input({ required: false }) asyncValidations: IKlesValidator<AsyncValidator>[] = [];

    inputRef: MatFormFieldControl<MatFormFieldControl<any>>;

    constructor(private _inj: Injector) {

    }

    ngAfterViewInit() {
        let container = this._inj.get(MatFormField, null, { optional: true });
        this.inputRef = container?._control;
    }
}
