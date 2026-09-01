import { ChangeDetectorRef, Type } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { klesFieldControlFactory, klesFieldUiFactory } from '../factories/field.factory';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { AbstractUiState } from '../ui/ui-state/ui-state.abstract';


export const componentMapper: {
    component: Type<any>;
    type: string;
    factory: (field: IKlesFieldConfig, ref?: ChangeDetectorRef) => AbstractControl<any, any> | null;
    ui: (field: IKlesFieldConfig) => AbstractUiState<any, any>;
}[] = [];

export function FieldMapper(config: { type: string; factory?: (field: IKlesFieldConfig) => AbstractControl<any, any> | null; ui?: (field: IKlesFieldConfig) => AbstractUiState<any, any> }) {
    return (target: Type<any>) => {
        componentMapper.push({
            component: target,
            type: config.type,
            factory: config.factory || klesFieldControlFactory,
            ui: config.ui || klesFieldUiFactory,
        });
    };
}
