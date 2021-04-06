# Interfaces
- [`IFieldConfig`](#ifieldconfig): List of attribute field
- [`IField`](#ifield): Composition of IFieldConfig and FormGroup
- [`IValidator`](#ivalidator): Validator interface

#### IFieldConfig

Interface field model

type?: string: Mapper type if(type && !component)=>type
name: string: Name Field (key for FormControlName)
component?: Type<any>;
id?: string: Attribut html id
label?: string: Label field
placeholder?: string: Placeholder field
tooltip?: string: Tooltip field
inputType?: string: Type 
options?: string[]: List options for list component
ngClass?: any: ngclass for field
ngStyle?: any: ngStyle for field
property?: string: Property for field
collections?: any: Collections for subfield
value?: any: Value field
multiple?: boolean: Multiple selection field
disabled?: boolean: Disabled field
autocomplete?: boolean: Autocomplete input field
indeterminate?: boolean: Indeterminate checkable component
excludeForm?: boolean: Property to exclude form control
validations?: IValidator<ValidatorFn>[];
asyncValidations?: IValidator<AsyncValidatorFn>[];
pipeTransform?: {
    pipe: PipeTransform,
    options?: any[]
}[];

##### File

```typescript
import { IFieldConfig } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'select',
  component: CheckboxComponent,
  indeterminate: false,
} as IFieldConfig
```

```html
<mat-checkbox matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [indeterminate]="field.indeterminate" [formControlName]="field.name">{{field.label | translate}}</mat-checkbox>
```

#### IField

IField is composed to IFieldConfig and FormGroup

##### File

```typescript
import { IField } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field:IField={
  name: 'select',
  component: CheckboxComponent,
  indeterminate: false,
} as IFieldConfig;

const group:FormGroup = this.fb.group({});
const control= this.fb.control(field.value || ''));
group.addControl(field.name, control);
```

```html
<ng-container dynamicField [field]="field" [group]="group"></ng-container>
```

#### IValidator

Interface validator form

##### File

```typescript
import { IValidator } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const validator:IValidator =  {
  name: 'required',
  validator: Validators.required,
  message: 'statusSettings.color.validator.required'
};


const validations:IValidator[] = [
  {
    name: 'required',
    validator: Validators.required,
    message: 'statusSettings.color.validator.required'
  },
  {
    name: 'pattern',
    validator: Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
    message: 'statusSettings.color.validator.notValid'
  }
 ]
```