import { IKlesFieldConfig } from './field.config.interface';
import { FormGroup } from '@angular/forms';

export interface IKlesField {
    field: IKlesFieldConfig;
    group: FormGroup;
}
