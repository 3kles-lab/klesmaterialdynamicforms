# Directives
- [`KlesComponentDirective`](#klescomponentdirective): Directive to inject component with value
- [`KlesDynamicFieldDirective`](#klesdynamicfielddirective): Directive to inject component with IFieldConfig in FormGroup
  
#### KlesComponentDirective

Directive to create component with value

##### File

```typescript
import { KlesComponentDirective } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const component=AutoCompleteComponent //Component
const option=[{test:'a',label:'aaa'},{test:'b',label:'bbb'}] //Any value
```

```html
<ng-container klesComponent [component]="autocompleteComponent" [value]="option"></ng-container>
```

#### KlesDynamicFieldDirective

Directive to create field with IFieldConfig and FormGroup

##### File

```typescript
import { KlesDynamicFieldDirective } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const field={
  name: 'input',
  placeholder: 'input text',
  component: KlesFormInputComponent
} as IFieldConfig

const form=FormGroup({
  input:new FormControl()
});
```

```html
<ng-container klesDynamicField [field]="field" [group]="form"></ng-container>
```
