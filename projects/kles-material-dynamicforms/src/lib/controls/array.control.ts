import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { KlesFormControl } from "./default.control";
import { v4 as uuidv4 } from 'uuid';
import { componentMapper } from "../decorators/component.decorator";
import { klesFieldControlFactory } from "../factories/field.factory";

export class KlesFormArray extends KlesFormControl {

    public create(): AbstractControl<any, any> {
        const array = new FormArray([], {
            validators: this.bindValidations(this.field.validations || []),
            asyncValidators: this.bindAsyncValidations(this.field.asyncValidations || []),
            updateOn: this.field.updateOn || 'change'
        });

        if (this.field.value && Array.isArray(this.field.value)) {
            if (this.field.collections && Array.isArray(this.field.collections)) {
                this.field.value.forEach(val => {
                    const group = new FormGroup({});
                    const line = { ...val, _id: val?._id || uuidv4() };
                    this.field.collections?.forEach(subfield => {
                        const data = line[subfield.name] || null;
                        let control;
                        if (subfield.type) {
                            control = componentMapper.find(c => c.type === subfield.type)?.factory({ ...subfield, ...(data && { value: data }) })
                                || klesFieldControlFactory({ ...subfield, ...(data && { value: data }) });
                        } else {
                            control = componentMapper.find(c => c.component === subfield.component)?.factory({ ...subfield, ...(data && { value: data }) })
                                || klesFieldControlFactory({ ...subfield, ...(data && { value: data }) });
                        }
                        group.addControl(subfield.name, control);
                    });
                    array.push(group);
                });
            }
        } else {
            const group = new FormGroup({ _id: new FormControl(uuidv4()) });
            this.field.collections?.forEach(subfield => {
                let control;
                if (subfield.type) {
                    control = componentMapper.find(c => c.type === subfield.type)?.factory({ ...subfield })
                        || klesFieldControlFactory({ ...subfield });
                } else {
                    control = componentMapper.find(c => c.component === subfield.component)?.factory({ ...subfield })
                        || klesFieldControlFactory({ ...subfield });

                }
                group.addControl(subfield.name, control);
            });
            array.push(group);
        }


        if (this.field.disabled) {
            array.disable();
        }


        return array;
    }
}
