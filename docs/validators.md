# Validators
- [`autocompleteObjectValidator`](#autocompleteObjectValidator): Autocomplete object validator
- [`autocompleteStringValidator`](#autocompleteStringValidator): Autocomplete string validator

### autocompleteObjectValidator

Validator to check object list

##### File

```typescript
import { autocompleteObjectValidator } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const fieldMandatory={
  component: KlesFormInputComponent,
  placeholder: 'autocomplete mandatory with object array',
  name: 'autocompleteWithobjectMandatory',
  autocomplete: true,
  autocompleteComponent: AutocompleteComponent,
  property: 'test',
  options: [
    { test: 'aaa', val: 'rrr' },
    { test: 'bbb', val: 'bbb' }
  ] as any,
  validations: [
    {
      name: 'list',
      validator: autocompleteObjectValidator(),
      message: 'Not in list'
    }
  ]
} as IFieldConfig

const fieldOptional={
  component: KlesFormInputComponent,
  placeholder: 'autocomplete optional with object array',
  name: 'autocompleteWithobjectOptional',
  autocomplete: true,
  autocompleteComponent: AutocompleteComponent,
  property: 'test',
  options: [
    { test: 'aaa', val: 'rrr' },
    { test: 'bbb', val: 'bbb' }
  ] as any,
  validations: [
    {
      name: 'list',
      validator: autocompleteObjectValidator(true),
      message: 'Not in list'
    }
  ]
}
```

### autocompleteStringValidator

Validator to check string list

##### File

```typescript
import { autocompleteStringValidator } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
const fieldMandatory={
  component: KlesFormInputComponent,
  label: 'autoComplete',
  placeholder: 'autocomplete mandatory with string array',
  name: 'autocompleteMandatory',
  autocomplete: true,
  options: [
    'aaa',
    'bbb'
  ] as any,
  validations: [
    {
      name: 'list',
      validator: autocompleteStringValidator([
        'aaa',
        'bbb'
      ]),
      message: 'Not in list'
    }
  ]
};

const fieldOptional={
  component: KlesFormInputComponent,
  label: 'autoComplete',
  placeholder: 'autocomplete optional with string array',
  name: 'autocompleteOptional',
  autocomplete: true,
  options: [
    'aaa',
    'bbb'
  ] as any,
  validations: [
    {
      name: 'list',
      validator: autocompleteStringValidator([
        'aaa',
        'bbb'
      ], true),
      message: 'Not in list'
    }
  ]
};

```
