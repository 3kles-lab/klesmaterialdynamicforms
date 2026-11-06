import { AbstractControl, FormArray } from '@angular/forms';
import { KlesFormControl } from './default.control';
import { createKlesFormArrayGroup } from '../factories/form-array-group.factory';
import { listFieldLimitsValidator } from './list-field-limits';

export class KlesFormArray extends KlesFormControl {
    public create(): AbstractControl<any, any> {
        const array = new FormArray<AbstractControl>([], {
            validators: this.bindValidations(this.field.validations || []),
            asyncValidators: this.bindAsyncValidations(this.field.asyncValidations || []),
            updateOn: this.field.updateOn || 'change',
        });

        if (this.field.listFieldOptions) {
            array.addValidators(listFieldLimitsValidator(this.field.listFieldOptions));
        }

        if (Array.isArray(this.field.value)) {
            for (const value of this.field.value) {
                array.push(createKlesFormArrayGroup(this.field, this.ref, value));
            }
        } else {
            array.push(createKlesFormArrayGroup(this.field, this.ref));
        }

        if (this.field.listFieldOptions) array.updateValueAndValidity({ emitEvent: false });

        if (this.field.disabled) {
            array.disable();
        }

        return array;
    }
}
