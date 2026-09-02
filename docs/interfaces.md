# Interfaces
- [`IFieldConfig`](#ifieldconfig): List of attribute field
- [`IField`](#ifield): Composition of IFieldConfig and FormGroup
- [`IValidator`](#ivalidator): Validator interface

## Advanced form layout

`KlesDynamicFormComponent` keeps its historical `row`, `column` and `wrap` API.
The CSS Grid renderer is enabled automatically as soon as a root element declares
`layout`; `direction="grid"` can still force it when every field uses the defaults.
The grid has 12 columns and no gap by default; override them with
`[layout]="{ columns: 12, gap: '16px' }"`.

Each field accepts `layout?: IKlesElementLayout`:

```typescript
const fields: KlesFormElement[] = [
  { name: 'firstname', component: KlesFormInputComponent, layout: { colSpan: 6 } },
  { name: 'lastname', component: KlesFormInputComponent, layout: { colSpan: 6 } },
  { name: 'email', component: KlesFormInputComponent, layout: { colSpan: 12 } },
];
```

Available placement properties are `colSpan`, `rowSpan`, `colStart`, `rowStart`,
`class`, and `responsive` (`xs`, `sm`, `md`, `lg`, `xl`). Defaults are
`colSpan: 12` and `rowSpan: 1`. Invalid numeric values are clamped to the current
grid and produce a development warning.

Sections and layout groups create independent grid contexts without creating a
`FormControl` or `FormGroup`:

```typescript
const fields: KlesFormElement[] = [{
  type: 'section',
  title: 'Adresse',
  icon: 'home',
  description: 'Adresse principale',
  fields: [{
    type: 'layoutGroup',
    layoutConfig: { columns: 12, gap: '16px' },
    fields: [
      { name: 'street', component: KlesFormInputComponent, layout: { colSpan: 12 } },
      { name: 'postalCode', component: KlesFormInputComponent, layout: { colSpan: 4 } },
      { name: 'city', component: KlesFormInputComponent, layout: { colSpan: 8 } },
    ],
  }],
}];
```

`type: 'divider'` and `type: 'spacer'` (with an optional CSS length or numeric
pixel `size`) are also available. They never create controls. The existing named
`EnumType.group` field remains a data-bearing nested Angular `FormGroup` and is
distinct from the structural `layoutGroup` above.

#### IFieldConfig

Interface field model

- type?: string: Mapper type if(type && !component)=>type
- name: string: Name Field (key for FormControlName)
- component?: Type<any>;
- id?: string: Attribut html id
- label?: string: Label field
- placeholder?: string: Placeholder field
- tooltip?: string: Tooltip field
- inputType?: string: Type 
- options?: string[]: List options for list component
- ngClass?: any: ngclass for field
- ngStyle?: any: ngStyle for field
- property?: string: Property for field
- collections?: any: Collections for subfield
- value?: any: Value field
- multiple?: boolean: Multiple selection field
- disabled?: boolean: Disabled field
- autocomplete?: boolean: Autocomplete input field
- indeterminate?: boolean: Indeterminate checkable component
- excludeForm?: boolean: Property to exclude form control
- validations?: IValidator<ValidatorFn>[];
- asyncValidations?: IValidator<AsyncValidatorFn>[];
- pipeTransform?: {
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
<mat-checkbox [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="field.ngClass" [indeterminate]="field.indeterminate" [formControlName]="field.name">{{label()}}</mat-checkbox>
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
