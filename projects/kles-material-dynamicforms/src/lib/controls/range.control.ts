import { AbstractControl, FormControl, FormGroup, UntypedFormGroup } from "@angular/forms";
import { KlesFormControl } from "./default.control";

export class KlesFormRange extends KlesFormControl {

    public create(): AbstractControl<any, any> {
        const range = new FormGroup({
            start: new FormControl(this.field.value?.start),
            end: new FormControl(this.field.value?.end),
        }, {
            validators: this.bindValidations(this.field.validations || []),
            asyncValidators: this.bindAsyncValidations(this.field.asyncValidations || []),
        });

        if (this.field.disabled) {
            range.disable();
        }
        return range;
    }
}
