import { AbstractControl, FormArray } from '@angular/forms';
import { KlesFormControl } from './default.control';
import { createKlesFormArrayGroup } from '../factories/form-array-group.factory';

export class KlesFormArray extends KlesFormControl {
    public create(): AbstractControl<any, any> {
        const array = new FormArray<AbstractControl>([], {
            validators: this.bindValidations(this.field.validations || []),
            asyncValidators: this.bindAsyncValidations(this.field.asyncValidations || []),
            updateOn: this.field.updateOn || 'change',
        });

        if (Array.isArray(this.field.value)) {
            for (const value of this.field.value) {
                array.push(createKlesFormArrayGroup(this.field, this.ref, value));
            }
        } else {
            array.push(createKlesFormArrayGroup(this.field, this.ref));
        }

        if (this.field.disabled) {
            array.disable();
        }

        return array;
    }
}
