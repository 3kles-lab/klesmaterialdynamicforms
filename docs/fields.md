# Fields
- [`KlesFieldAbstract`](#klesfieldabstract): Abstract class to build field component
- [`KlesFormButtonComponent`](#klesformbuttoncomponent): Button in form
- [`KlesFormButtonCheckerComponent`](#klesFormbuttoncheckercomponent): Button checker to manage checking and error in form
- [`KlesFormCheckboxComponent`](#klesformcheckboxcomponent): Checkbox in form
- [`KlesFormChipComponent`](#klesformchipcomponent): Chip in form
- [`KlesFormColorComponent`](#klesformcolorcomponent): ColorPicker in form
- [`KlesFormDateComponent`](#klesformdatecomponent): DatePicker in form
- [`KlesFormGroupComponent`](#klesformgroupcomponent): FormGroup in form
- [`KlesFormIconComponent`](#klesformiconcomponent): FormGroup in form
- [`KlesFormInputComponent`](#klesforminputcomponent): Input in form
- [`KlesFormPhoneComponent`](#klesformphonecomponent): International phone field with a country selector
- [`KlesFormInputClearableComponent`](#klesforminputclearablecomponent): Input clearable in form
- [`KlesFormListFieldComponent`](#klesformlistfieldcomponent): List of field in form
- [`KlesFormRadioComponent`](#klesformradiocomponent): RadioButton in form
- [`KlesFormSelectComponent`](#klesformselectcomponent): Select in form
- [`KlesFormTextComponent`](#klesformtextcomponent): Display text in form
- [`KlesFormTextareaComponent`](#klesformtextareacomponent): TextArea in form

#### KlesFormPhoneComponent

Composite Angular Material field with a localized Material country selector and calling codes.
The selected country is displayed compactly as `FR (+33)`; the dropdown retains full localized names.
An example mobile number for the selected country appears when the input is empty, unless a custom
`placeholder` is configured. A subtle vertical separator distinguishes the two zones.
`KlesPhoneControlComponent` implements `MatFormFieldControl<string>` and `ControlValueAccessor`;
it can also be used directly inside a `mat-form-field` with reactive forms.

```typescript
import { EnumType, IKlesFieldConfig } from '@3kles/kles-material-dynamicforms';

const phoneField: IKlesFieldConfig = {
    type: EnumType.phone,
    name: 'phone',
    label: 'Téléphone',
    appearance: 'outline',
    clearable: true,
    value: '+33612345678',
    phoneOptions: {
        defaultCountry: 'FR',
        countries: ['FR', 'BE', 'CH', 'GB', 'US', 'CA'],
        locale: 'fr-FR',
        countryLabel: 'Pays et indicatif',
        internationalLabel: 'International',
        invalidMessage: 'Numéro de téléphone invalide.',
    },
};
```

Import `KlesFormPhoneComponent` to register `EnumType.phone` when using standalone components,
or import `KlesMaterialDynamicformsModule`. You can also set `component: KlesFormPhoneComponent`.

The default country is `FR`; all countries supported by `libphonenumber-js` are offered by default.
Country names use `LOCALE_ID` unless `phoneOptions.locale` is supplied. `countries` limits the selector,
not validation: international numbers from other countries remain accepted via the International option.
National input is interpreted using the selected country. Pasted `+` and `00` numbers detect their country.
Selecting a different country clears the number and emits `null`, while keeping the newly selected
country. Input is formatted while typing
using the selected country's numbering plan (`061234` in France displays `06 12 34`). Letters and
unsupported punctuation are filtered out; overlong insertions and extensions are rejected.
Cursor positioning and deletion across formatting separators are preserved. Blur formats valid
international input in national notation when a country is selected.

Valid control values are E.164 strings (`06 12 34 56 78` in France becomes `+33612345678`).
Empty input emits `null`. Incomplete or invalid numeric input is preserved as a string and sets the `phone`
validation error, so submit only valid forms. Validation uses `libphonenumber-js/max` numbering-plan
metadata, supports fixed-line and mobile numbers, and rejects extensions. Optional empty fields are
valid; add `Validators.required` through the usual `validations` configuration to make them mandatory.
Existing synchronous and asynchronous validators, `updateOn`, reset and disabled states are preserved.
The default error text can be customized using `KlesDynamicFormIntl.phoneInvalid` or `invalidMessage`.

For direct standalone usage, import `KlesPhoneControlComponent`, `MatFormFieldModule` and
`ReactiveFormsModule`:

```html
<mat-form-field appearance="outline">
    <mat-label>Téléphone</mat-label>
    <kles-phone-control [formControl]="phoneControl"
        ariaLabel="Téléphone" [options]="{ defaultCountry: 'FR' }" />
    <mat-error>Numéro de téléphone invalide</mat-error>
</mat-form-field>
```

#### KlesFieldAbstract

Abstract class to build field component

##### File

```typescript
import { KlesFieldAbstract } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
@Component({
    selector: 'kles-form-text',
    template: `
    <span [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="field.ngClass">
        {{group.controls[field.name].value}}
    </span> 
`
})
export class KlesFormTextComponent extends KlesFieldAbstract implements OnInit {
    ngOnInit() {
        super.ngOnInit();
    }
}

```

#### KlesFormButtonComponent

Button in form

##### File

```typescript
import { KlesFormButtonComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'button',
  label: 'text button',
  color: 'accent',
  icon: 'clear',
  iconSvg:'excel',
  ngClass: 'mat-raised-button',
  tooltip:'tooltip button',
  component: KlesFormButtonComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  button:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormButtonCheckerComponent

Button checker to manage checking and error in form

##### File

```typescript
import { KlesFormButtonCheckerComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'checkererror',
  label: 'View error',
  color: 'warning',
  icon: 'clear',
  ngClass: 'mat-raised-button',
  tooltip: 'tooltip button',
  value: { error: [{}, {}] }
  component: KlesFormButtonCheckerComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  checkererror:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```


#### KlesFormCheckboxComponent

Checkbox in form

##### File

```typescript
import { KlesFormCheckboxComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'check',
  value: false,
  tooltip:'checktooltip',
  label:'labelCheck',
  indeterminate:false,
  component: KlesFormCheckboxComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  check:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```


#### KlesFormChipComponent

Chip in form

##### File

```typescript
import { KlesFormChipComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'chip',
  value: 'chip',
  tooltip:'chiptooltip',
  color:'primary',
  component: KlesFormChipComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  chip:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```


#### KlesFormColorComponent

Button in form

##### File

```typescript
import { KlesFormColorComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'color',
  placeholder: 'color',
  tooltip:'colortooltip',
  value:'#ABCDEF'
  component: KlesFormColorComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  color:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```


#### KlesFormDateComponent

Button in form

##### File

```typescript
import { KlesFormDateComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'date',
  placeholder: 'date',
  tooltip:'datetooltip',
  value:new Date(),
  component: KlesFormDateComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  button:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```


#### KlesFormGroupComponent

FormGroup in form

##### File

```typescript
import { KlesFormGroupComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'group',
  direction: 'row',
  wrap: false, // true by default; false prevents fields from wrapping
  collections:[
    {
      component: KlesFormButtonComponent,
      ngClass: 'mat-icon-button',
      icon: 'launch',
      color: 'primary',
      tooltip: 'detail',
      name: 'detail',
    },{
      component: KlesFormButtonComponent,
      ngClass: 'mat-icon-button',
      icon: 'add',
      color: 'primary',
      tooltip: 'add',
      name: 'add',
    }
  ]
  component: KlesFormGroupComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  button:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormIconComponent

Icon in form

##### File

```typescript
import { KlesFormIconComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'icon',
  value:'add',
  color:'primary',
  tooltip:'tooltipicon'
  component: KlesFormIconComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  button:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormInputComponent

Input in form

##### File

```typescript
import { KlesFormInputComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'inputtext',
  placeholder: 'Input Text',
  inputType: 'text',
  tooltip: 'tooltip text',
  value: 'input text value',
  component: KlesFormInputComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  inputtext:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormInputClearableComponent

Input clearable in form. A icon is added to clear input.

##### File

```typescript
import { KlesFormInputClearableComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'inputtext',
  placeholder: 'Input Text',
  inputType: 'text',
  tooltip: 'tooltip text',
  value: 'input text value',
  component: KlesFormInputComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  inputtext:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormListFieldComponent

List field in form is to add FormGroup in FormArray with add button.

##### File

```typescript
import { KlesFormListFieldComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'listfield',
  collections:[],
  component: KlesFormListFieldComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  listfield:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormRadioComponent

RadioButton in form

##### File

```typescript
import { KlesFormRadioComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'radio',
  label: 'radio',
  tooltip: 'radiotooltip',
  options:[false,true],
  component: KlesFormRadioComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  button:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormSelectComponent

Select in form

##### File

```typescript
import { KlesFormSelectComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'select',
  label: 'select',
  tooltip: 'selecttooltip',
  options:[{key:'a',label:'aaa'},{key:'b',label:'bbb'}],
  property:'key',
  component: KlesFormSelectComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  select:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormTextComponent

Display text in form

##### File

```typescript
import { KlesFormTextComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'text',
  value: 'textvalue',
  tooltip:'texttooltip',
  component: KlesFormTextComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  text:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```

#### KlesFormTextAreaComponent

TextArea in form

##### File

```typescript
import { KlesFormTextAreaComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'textarea',
  placeholder:'textarea',
  value: 'textareavalue',
  tooltip:'textareatooltip',
  textareaAutoSize:{
    minRows:1,
    maxRows:10
  },
  component: KlesFormTextAreaComponent,
} as IFieldConfig

const form:FormGroup=new FormGroup({
  textarea:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```
