[![pipeline status](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/badges/master/pipeline.svg)](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/-/commits/master)

# @3kles/kles-material-dynamicforms

**kles-material-dynamicforms** is a component library to build `Material Angular Form`.

## Changelog

Check out the [changelog](./CHANGELOG.md) to check all the latest changes.

## KlesDynamicFormComponent
- [`KlesDynamicFormComponent`](docs/readme.md#KlesDynamicFormComponent): Component to create form with list of IFieldConfig

## Directives
- [Directives](./docs/directives.md): List of directives
- [`KlesComponentDirective`](./docs/directives.md#KlesComponentDirective): Directive to inject component with value
- [`KlesDynamicFieldDirective`](./docs/directives.md#KlesDynamicFieldDirective): Directive to inject component with IFieldConfig in FormGroup


## Interfaces
- [Interfaces](./docs/interfaces.md): List of interfaces
- [`IFieldConfig`](./docs/interfaces.md#ifieldconfig): List of attribute field
- [`IField`](./docs/interfaces.md#ifield): Composition of IFieldConfig and FormGroup
- [`IValidator`](./docs/interfaces.md#ivalidator): Validator interface

## Fields
- [Fields](./docs/fields.md): List of field to build form
- [`KlesFieldAbstract`](./docs/fields.md#KlesFieldAbstract): Abstract class to build field component
- [`KlesFormButtonComponent`](./docs/fields.md#KlesFormButtonComponent): Button in form
- [`KlesFormButtonCheckerComponent`](./docs/fields.md#KlesFormButtonCheckerComponent): Button checker to manage checking and error in form
- [`KlesFormCheckboxComponent`](./docs/fields.md#KlesFormCheckboxComponent): Checkbox in form
- [`KlesFormChipComponent`](./docs/fields.md#KlesFormChipComponent): Chip in form
- [`KlesFormColorComponent`](./docs/fields.md#KlesFormColorComponent): ColorPicker in form
- [`KlesFormDateComponent`](./docs/fields.md#KlesFormDateComponent): DatePicker in form
- [`KlesFormGroupComponent`](./docs/fields.md#KlesFormGroupComponent): FormGroup in form
- [`KlesFormInputComponent`](./docs/fields.md#KlesFormInputComponent): Input in form
- [`KlesFormInputClearableComponent`](./docs/fields.md#KlesFormInputClearableComponent): Input clearable in form
- [`KlesFormListFieldComponent`](./docs/fields.md#KlesFormListFieldComponent): List of field in form
- [`KlesFormRadioComponent`](./docs/fields.md#KlesFormRadioComponent): RadioButton in form
- [`KlesFormSelectComponent`](./docs/fields.md#KlesFormSelectComponent): Select in form
- [`KlesFormTextComponent`](./docs/fields.md#KlesFormTextComponent): Display text in form
- [`KlesFormTextareaComponent`](./docs/fields.md#KlesFormTextareaComponent): TextArea in form

## Matchers
- [Matchers](./docs/matchers.md): List of matchers
- [`KlesFormErrorStateMatcher`](./docs/matchers.md#KlesFormErrorStateMatcher): Error state matcher for form

## Validators
- [Validators](./docs/validators.md): List of validators
- [`autocompleteObjectValidator`](./docs/validators.md#autocompleteObjectValidator): Autocomplete object validator
- [`autocompleteStringValidator`](./docs/validators.md#autocompleteStringValidator): Autocomplete string validator
## Install

### npm

```
npm install @3kles/kles-material-dynamicforms --save
```

## How to use

Check the [`documentation`](./docs) for how to import mdolule in your `NgModule` and how to use component and directive.

## Tests

```
npm install
npm test
```
## License

[`MIT`](./LICENSE.md)
