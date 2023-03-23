import { Type } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { klesFieldControlFactory } from '../factories/field.factory';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

export const componentMapper: {
    component: Type<any>; type: string;
    factory: ((field: IKlesFieldConfig) => AbstractControl<any, any>)
}[] = [];

export function FieldMapper(config: {
    type: string,
    factory?: (field: IKlesFieldConfig) => AbstractControl<any, any>
}) {
    return (target: Type<any>) => {
        componentMapper.push({
            component: target,
            type: config.type,
            factory: config.factory || klesFieldControlFactory
        });
    };
}
