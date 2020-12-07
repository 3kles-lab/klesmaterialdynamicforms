import { IFieldConfig } from '.';
import { FormGroup } from '@angular/forms';

export interface IField {
    field: IFieldConfig;
    group: FormGroup;
}
