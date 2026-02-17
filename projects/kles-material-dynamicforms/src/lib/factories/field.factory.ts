import { ChangeDetectorRef } from '@angular/core';
import { KlesFormControl } from '../controls/default.control';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFormUiControl } from '../ui/default.ui';
import { AbstractUiState } from '../ui/ui-state/ui-state.abstract';
import { AbstractControl } from '@angular/forms';

export const klesFieldControlFactory = (field: IKlesFieldConfig, ref?: ChangeDetectorRef): AbstractControl => {
    const factory = new KlesFormControl(field, ref);
    return factory.create();
};

export const klesFieldUiFactory = (field: IKlesFieldConfig): AbstractUiState => {
    const factory = new KlesFormUiControl(field);
    return factory.create();
};
