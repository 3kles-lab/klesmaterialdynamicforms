import { IFieldConfig } from './field.config.interface';
import { FormGroup } from '@angular/forms';

export interface IField {
    field: IFieldConfig;
    group: FormGroup;
}
