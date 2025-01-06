import { AbstractControl, FormGroup, UntypedFormGroup } from "@angular/forms";
import { KlesFormControl } from "./default.control";
import { componentMapper } from "../decorators/component.decorator";
import { klesFieldControlFactory } from "../factories/field.factory";
import { concat, of } from "rxjs";
import { catchError, map, take } from "rxjs/operators";

export class KlesFormGroup extends KlesFormControl {

    public create(): AbstractControl<any, any> {
        const subGroup = new UntypedFormGroup({});

        if (this.field.collections && Array.isArray(this.field.collections)) {
            this.field.collections.forEach(subfield => {
                let control;
                if (subfield.type) {
                    control = componentMapper.find(c => c.type === subfield.type)?.factory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] }, this.ref)
                        || klesFieldControlFactory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] }, this.ref);
                } else {
                    control = componentMapper.find(c => c.component === subfield.component)?.factory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] })
                        || klesFieldControlFactory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] }, this.ref);
                }

                subGroup.addControl(subfield.name, control);
            });
        }

        if (this.field.disabled) {
            subGroup.disable();
        }

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
                this.field.collections.forEach((col) => col.pending = response.pending);
                if (response.pending) {
                    subGroup.disable({ emitEvent: false });
                } else {
                    if (!this.field.disabled) {
                        subGroup.enable({ emitEvent: false });
                    }
                    subGroup.patchValue(response.value);
                    this.field.value = response.value;
                }
            });
        }

        return subGroup;
    }
}
