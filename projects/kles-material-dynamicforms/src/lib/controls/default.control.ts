import { AbstractControl, FormControl } from "@angular/forms";
import { concat, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";
import { KlesAbstractFormControl } from "./control.abstract";

export class KlesFormControl extends KlesAbstractFormControl {

    public create(): AbstractControl {
        const control = new FormControl(
            { value: this.field.value, disabled: this.field.disabled || false },
            {
                nonNullable: this.field.nonNullable || false,
                validators: this.bindValidations(this.field.validations || []),
                asyncValidators: this.bindAsyncValidations(this.field.asyncValidations || []),
                updateOn: this.field.updateOn || 'change',
            }
        );

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
}
