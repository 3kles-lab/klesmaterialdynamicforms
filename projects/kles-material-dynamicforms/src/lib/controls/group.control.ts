import { AbstractControl, FormGroup, UntypedFormGroup } from "@angular/forms";
import { KlesFormControl } from "./default.control";
import { componentMapper } from "../decorators/component.decorator";
import { klesFieldControlFactory } from "../factories/field.factory";

export class KlesFormGroup extends KlesFormControl {

    public create(): AbstractControl<any, any> {
        const subGroup = new UntypedFormGroup({});

        if (this.field.collections && Array.isArray(this.field.collections)) {
            this.field.collections.forEach(subfield => {
                let control;
                if (subfield.type) {
                    control = componentMapper.find(c => c.type === subfield.type)?.factory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] })
                        || klesFieldControlFactory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] });
                } else {
                    control = componentMapper.find(c => c.component === subfield.component)?.factory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] })
                        || klesFieldControlFactory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] });
                }

                subGroup.addControl(subfield.name, control);
            });
        }

        if (this.field.disabled) {
            subGroup.disable();
        }

        console.log('subGroup', subGroup)

        return subGroup;
    }
}
