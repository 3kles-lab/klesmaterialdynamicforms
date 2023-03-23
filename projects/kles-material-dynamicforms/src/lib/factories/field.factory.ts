import { KlesFormControl } from "../controls/default.control";
import { IKlesFieldConfig } from "../interfaces/field.config.interface";


export const klesFieldControlFactory = (field: IKlesFieldConfig) => {
    const factory = new KlesFormControl(field);
    return factory.create();
}



