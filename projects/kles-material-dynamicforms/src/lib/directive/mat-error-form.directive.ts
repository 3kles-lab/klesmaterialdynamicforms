import { Component, AfterViewInit, Injector, Input } from "@angular/core";
import { IKlesValidator } from "../interfaces/validator.interface";
import { AsyncValidator, FormGroup, Validators } from "@angular/forms";
import { KlesDynamicFormComponent } from "../dynamic-form.component";

@Component({
  selector: '[matErrorForm]',
  template: `
        @for (validation of validations; track validation.name) {
            @if (inputRef?.form?.hasError(validation.name) && validation.message) {
                {{validation.message | translate}}
            }
        }
        @for (validation of asyncValidations; track validation.name) {
            @if (inputRef?.form?.hasError(validation.name) && validation.message) {
                {{validation.message | translate}}
            }
        }
    `
})
export class MatErrorFormDirective implements AfterViewInit {
  @Input({ required: false }) validations: IKlesValidator<Validators>[] = [];
  @Input({ required: false }) asyncValidations: IKlesValidator<AsyncValidator>[] = [];

  inputRef: KlesDynamicFormComponent

  constructor(private _inj: Injector) {
  }

  ngAfterViewInit() {
    let container = this._inj.get(KlesDynamicFormComponent, null, { optional: true });
    this.inputRef = container;
  }
}
