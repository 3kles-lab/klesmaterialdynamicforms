import { AbstractControl, FormControl, UntypedFormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { componentMapper } from '../decorators/component.decorator';
import { klesFieldControlFactory } from './field.factory';
import { ChangeDetectorRef } from '@angular/core';

export function createKlesFormArrayGroup(field: IKlesFieldConfig, ref?: ChangeDetectorRef, value?: Record<string, any>): UntypedFormGroup {
    const line: Record<string, any> = {
        ...(value ?? {}),
        _id: value?._id ?? uuidv4(),
    };

    const group = new UntypedFormGroup({
        _id: new FormControl(line._id),
    });

    for (const subfield of field.collections ?? []) {
        const data = line[subfield.name];

        const childField: IKlesFieldConfig = {
            ...subfield,
            ...(data !== undefined ? { value: data } : {}),
        };

        let control: AbstractControl;

        if (subfield.type) {
            control = componentMapper.find((c) => c.type === subfield.type)?.factory(childField, ref) ?? klesFieldControlFactory(childField, ref);
        } else {
            control = componentMapper.find((c) => c.component === subfield.component)?.factory(childField, ref) ?? klesFieldControlFactory(childField, ref);
        }

        group.addControl(subfield.name, control);
    }

    return group;
}
