import { IKlesValidator } from './validator.interface';
import { ValidatorFn, AsyncValidatorFn, UntypedFormGroup } from '@angular/forms';
import { PipeTransform, Type, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { EnumType } from '../enums/type.enum';
import { IKlesField } from './field.interface';
import { IKlesDirective } from './directive.interface';

export interface IKlesFieldConfig {
    type?: EnumType;// Mapper type if(type && !component)=>type
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
    step?: number;
    options?: any[] | Subject<any[]>;// List options for list component
    ngClass?: any;// ngclass for field
    ngStyle?: any;// ngStyle for field
    property?: string;// Property for field
    collections?: any;// Collections for subfield
    value?: any;// Value field
    multiple?: boolean;// Multiple selection field
    disabled?: boolean;// Disabled field
    autocomplete?: boolean;// Autocomplete input field
    autocompleteComponent?: Type<any>;//Autocomplete component to display in list option
    displayWith?: ((value: any) => string) | null; // Autocomplete display format
    panelWidth?: string | number;//With for panel list option
    indeterminate?: boolean;// Indeterminate checkable component
    color?: string; //Material color
    icon?: string;//Material icon
    iconSvg?: string;//Svg Icon
    textareaAutoSize?: { minRows?: number; maxRows?: number }
    validations?: IKlesValidator<ValidatorFn>[];
    asyncValidations?: IKlesValidator<AsyncValidatorFn>[];
    pipeTransform?: {
        pipe: PipeTransform,
        options?: any[]
    }[];
    direction?: 'row' | 'column';
    valueChanges?: ((field: IKlesFieldConfig, group: UntypedFormGroup, siblingField?: IKlesFieldConfig[], valueChanged?: any) => void);
    triggerComponent?: Type<any>; //trigger component to customize trigger label in select
    virtualScroll?: boolean; //To activate virtual scroll
    itemSize?: number; // itemSize for virtual scroll viewport
    pending?: boolean;
    searchKeys?: string[]; //list of keys for multiple searches
    updateOn?: 'change' | 'blur' | 'submit';
    debounceTime?: number;
    directive?: (new (ref: ViewContainerRef, field: IKlesField) => IKlesDirective);
    visible?: boolean;
}
