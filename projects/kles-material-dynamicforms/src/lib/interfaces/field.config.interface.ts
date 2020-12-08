import { IKlesValidator } from './validator.interface';
import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { PipeTransform, Type } from '@angular/core';

export interface IKlesFieldConfig {
    type?: string;// Mapper type if(type && !component)=>type
    name: string;// Name Field (key for FormControlName)
    component?: Type<any>;
    id?: string;// Attribut html id
    label?: string;// Label field
    placeholder?: string;// Placeholder field
    tooltip?: string;// Tooltip field
    inputType?: string;// Type 
    min?: number;
    max?: number;
    maxLength?: number;
    options?: string[];// List options for list component
    ngClass?: any;// ngclass for field
    ngStyle?: any;// ngStyle for field
    property?: string;// Property for field
    collections?: any;// Collections for subfield
    value?: any;// Value field
    multiple?: boolean;// Multiple selection field
    disabled?: boolean;// Disabled field
    autocomplete?: boolean;// Autocomplete input field
    indeterminate?: boolean;// Indeterminate checkable component
    excludeForm?: boolean; // Property to exclude form control
    validations?: IKlesValidator<ValidatorFn>[];
    asyncValidations?: IKlesValidator<AsyncValidatorFn>[];
    pipeTransform?: {
        pipe: PipeTransform,
        options?: any[]
    }[];
}
