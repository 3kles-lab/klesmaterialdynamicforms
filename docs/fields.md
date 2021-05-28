# Fields
- [`KlesFieldAbstract`](#KlesFieldAbstract): Abstract class to build field component
- [`KlesFormButtonComponent`](#KlesFormButtonComponent): Button in form
- [`KlesFormButtonCheckerComponent`](#KlesFormButtonCheckerComponent): Button checker to manage checking and error in form
- [`KlesFormCheckboxComponent`](#KlesFormCheckboxComponent): Checkbox in form
- [`KlesFormChipComponent`](#KlesFormChipComponent): Chip in form
- [`KlesFormColorComponent`](#KlesFormColorComponent): ColorPicker in form
- [`KlesFormDateComponent`](#KlesFormDateComponent): DatePicker in form
- [`KlesFormGroupComponent`](#KlesFormGroupComponent): FormGroup in form
- [`KlesFormInputComponent`](#KlesFormInputComponent): Input in form
- [`KlesFormInputClearableComponent`](#KlesFormInputClearableComponent): Input clearable in form
- [`KlesFormListFieldComponent`](#KlesFormListFieldComponent): List of field in form
- [`KlesFormRadioComponent`](#KlesFormRadioComponent): RadioButton in form
- [`KlesFormSelectComponent`](#KlesFormSelectComponent): Select in form
- [`KlesFormTextComponent`](#KlesFormTextComponent): Display text in form
- [`KlesFormTextareaComponent`](#KlesFormTextareaComponent): TextArea in form

### KlesFieldAbstract

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
    <span matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass">
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

### KlesFormButtonComponent

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

### KlesFormButtonCheckerComponent

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


### KlesFormCheckboxComponent

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


### KlesFormChipComponent

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


### KlesFormColorComponent

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


### KlesFormDateComponent

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


### KlesFormGroupComponent

FormGroup in form

##### File

```typescript
import { KlesFormGroupComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'group',
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


### KlesFormInputComponent

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

### KlesFormInputClearableComponent

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

### KlesFormListFieldComponent

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

### KlesFormRadioComponent

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

### KlesFormSelectComponent

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

### KlesFormTextComponent

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

### KlesFormTextAreaComponent

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
