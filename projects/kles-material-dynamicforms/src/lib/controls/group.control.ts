import { AbstractControl, FormGroup, UntypedFormGroup } from "@angular/forms";
import { KlesFormControl } from "./default.control";

export class KlesFormGroup extends KlesFormControl {

    public create(): AbstractControl<any, any> {
        const subGroup = new UntypedFormGroup({});
        if (this.field.collections && Array.isArray(this.field.collections)) {
            this.field.collections.forEach(subfield => {
                const control = new KlesFormControl(subfield).create();
                subGroup.addControl(subfield.name, control);
            });
        }
        return subGroup;
    }
}
