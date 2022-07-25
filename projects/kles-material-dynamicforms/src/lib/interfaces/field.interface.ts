import { IKlesFieldConfig } from './field.config.interface';
import { UntypedFormGroup } from '@angular/forms';

export interface IKlesField {
    field: IKlesFieldConfig;
    group: UntypedFormGroup;
    siblingFields: IKlesFieldConfig[];
}
