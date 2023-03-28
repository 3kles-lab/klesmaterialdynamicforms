import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { KlesFormControl } from "./default.control";
import { v4 as uuidv4 } from 'uuid';

export class KlesFormArray extends KlesFormControl {

    public create(): AbstractControl<any, any> {
        const array = new FormArray([]);

        if (this.field.value && Array.isArray(this.field.value)) {
            if (this.field.collections && Array.isArray(this.field.collections)) {
                this.field.value.forEach(val => {
                    const group = new FormGroup({});
                    group.addControl('_id', new FormControl(uuidv4()));
                    this.field.collections.forEach(subfield => {
                        const data = val[subfield.name] || null;
                        const control = new KlesFormControl({ ...subfield, ...(data && { value: data }) }).create();
                        group.addControl(subfield.name, control);
                    });
                    array.push(group);
                });
            }
        } else {
            const group = new FormGroup({});
            this.field.collections.forEach(subfield => {
                const control = new KlesFormControl({ ...subfield }).create();
                group.addControl(subfield.name, control);
            });
            array.push(group);
        }
        return array;
    }
}
