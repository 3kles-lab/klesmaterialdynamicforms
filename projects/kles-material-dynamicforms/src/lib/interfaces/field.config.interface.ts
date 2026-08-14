import { IKlesValidator } from './validator.interface';
import { ValidatorFn, AsyncValidatorFn, UntypedFormGroup } from '@angular/forms';
import { PipeTransform, Provider, StaticProvider, Type, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EnumType } from '../enums/type.enum';
import { IKlesField } from './field.interface';
import { IKlesDirective } from './directive.interface';
import { DateAdapter, MatDateFormats } from '@angular/material/core';
import { SubscriptSizing } from '@angular/material/form-field';
import { MatButtonAppearance } from '@angular/material/button';

export interface IKlesFieldActionEvent<TContext = unknown, TValue = unknown> {
    actionId: string;
    value?: TValue;
    context: TContext | null;
    field: IKlesFieldConfig;
    group: UntypedFormGroup;
    originalEvent: Event;
}

export interface IKlesCurrencyOptions {
    /**
     * Code ISO 4217 : EUR, USD, GBP...
     * DEFAULT_CURRENCY_CODE sera utilisé par défaut.
     */
    code?: string;

    /**
     * Locale Intl : fr-FR, en-US...
     * LOCALE_ID sera utilisé par défaut.
     */
    locale?: string;

    display?: 'symbol' | 'narrowSymbol' | 'code' | 'name';

    minimumFractionDigits?: number;
    maximumFractionDigits?: number;

    useGrouping?: boolean;
    allowNegative?: boolean;
}

export type KlesStatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type KlesStatusAppearance = 'chip' | 'badge' | 'text';

export interface IKlesStatusDefinition {
    label: string;
    tone?: KlesStatusTone;
    icon?: string;
    iconSvg?: string;
    tooltip?: string;
    ariaLabel?: string;
    ngClass?: any;
}

export interface IKlesStatusOptions {
    values?: Record<string, IKlesStatusDefinition>;
    appearance?: KlesStatusAppearance;
    /**
     * Affiche un point coloré lorsque le statut
     * ne possède pas d'icône.
     */
    showDot?: boolean;
    fallback?: IKlesStatusDefinition;
    /**
     * Permet de gérer des valeurs plus complexes,
     * notamment des objets.
     */
    resolve?: (value: any, context: unknown | null, field: IKlesFieldConfig, group: UntypedFormGroup) => IKlesStatusDefinition | null;
}

export interface IKlesFieldUi {
    inputType?: 'text' | 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'time' | 'url' | 'week'; // Type
    min?: number | Date;
    max?: number | Date;
    maxLength?: number;
    step?: number;
    hostClass?: string | string[] | Set<string> | { [klass: string]: any }; // ngclass for host field
    ngClass?: any; // ngclass for field
    ngStyle?: any; // ngStyle for field
    indeterminate?: boolean; // Indeterminate checkable component
    color?: string; //Material color
    icon?: string; //Material icon
    iconSvg?: string; //Svg Icon
    appearance?: 'fill' | 'outline'; // MatForm field appearance
    buttonAppearance?: MatButtonAppearance;

    //TODO
    visible?: boolean;
    colorOption?: {
        disable?: boolean;
        position?: 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        positionOffset?: string;
        mode?: 'color' | 'grayscale' | 'presets';
        format?: 'auto' | 'hex' | 'rgba' | 'hsla';
    };
    direction?: 'column' | 'row' | 'grid' | 'inline-grid';
    textareaAutoSize?: { minRows?: number; maxRows?: number };
    virtualScroll?: boolean; //To activate virtual scroll
    itemSize?: number; // itemSize for virtual scroll viewport

    hint?: string;

    label?: string; // Label field
    placeholder?: any; // Placeholder field
    tooltip?: string; // Tooltip field

    imageUrl?: string;
    imageAlt?: string;
}

export interface IKlesFormField {
    type?: EnumType; // Mapper type if(type && !component)=>type
    name: string; // Name Field (key for FormControlName)
    component?: Type<any>;
    id?: string; // Attribut html id

    copyTooltip?: string; // Copy component tooltip
    options?: any[] | Subject<any[]> | Observable<any[]> | ((value?: string, group?: { [key: string]: any }) => Observable<any[]>); // List options for list component
    property?: string; // Property for field
    collections?: any; // Collections for subfield
    value?: any; // Value field
    asyncValue?: Observable<any>; // Value field
    multiple?: boolean; // Multiple selection field
    disabled?: boolean; // Disabled field
    autocomplete?: boolean; // Autocomplete input field
    autocompleteComponent?: Type<any>; //Autocomplete component to display in list option
    displayWith?: ((value: any) => string) | null; // Autocomplete display format
    panelWidth?: string | number; //With for panel list option
    pending?: boolean;
    validations?: IKlesValidator<ValidatorFn>[];
    asyncValidations?: IKlesValidator<AsyncValidatorFn>[];
    pipeTransform?: {
        pipe: PipeTransform;
        options?: any[];
    }[];

    valueChanges?: (field: IKlesFieldConfig, group: UntypedFormGroup, siblingField?: IKlesFieldConfig[], valueChanged?: any) => void;
    triggerComponent?: Type<any>; //trigger component to customize trigger label in select

    searchKeys?: string[]; //list of keys for multiple searches
    updateOn?: 'change' | 'blur' | 'submit';
    debounceTime?: number;
    directive?: new (ref: ViewContainerRef, field: IKlesField) => IKlesDirective;

    lazy?: boolean;
    buttonType?: 'submit' | 'button' | 'reset';
    accept?: string;
    dateOptions?: {
        adapter?: {
            class: Type<DateAdapter<any>>;
            deps?: any[];
        };
        language: string;
        dateFormat: MatDateFormats;
    };

    clearable?: boolean; /*active default clear component*/
    clearableComponent?: Type<any>; /*Override default clear component*/
    subComponents?: Type<any>[];
    autofocus?: boolean;
    subscriptSizing?: SubscriptSizing;
    nonNullable?: boolean;

    onFocus?: (field: IKlesFieldConfig, group: UntypedFormGroup) => void;
    onBlur?: (field: IKlesFieldConfig, group: UntypedFormGroup) => void;
    providers?: Array<Provider | StaticProvider>;

    onAction?: (event: IKlesFieldActionEvent<any, any>) => void;

    currencyOptions?: IKlesCurrencyOptions;
    statusOptions?: IKlesStatusOptions;
}

export type IKlesFieldConfig = IKlesFormField & IKlesFieldUi;
