import { ChangeDetectorRef } from "@angular/core";
import { KlesFormControl } from "../controls/default.control";
import { IKlesFieldConfig } from "../interfaces/field.config.interface";


export const klesFieldControlFactory = (field: IKlesFieldConfig, ref?: ChangeDetectorRef) => {
    const factory = new KlesFormControl(field, ref);
    return factory.create();
}



