import { ChangeDetectorRef } from '@angular/core';
import { KlesFormControl } from '../controls/default.control';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { ControlUiState } from '../ui/ui-state/control-ui-state';
import { KlesFormUiControl } from '../ui/default.ui';

export const klesFieldControlFactory = (field: IKlesFieldConfig, ref?: ChangeDetectorRef) => {
    const factory = new KlesFormControl(field, ref);
    return factory.create();
};

export const klesFieldUiFactory = (field: IKlesFieldConfig) => {
    const factory = new KlesFormUiControl(field);
    return factory.create();
};
