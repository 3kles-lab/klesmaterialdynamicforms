[![pipeline status](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/badges/master/pipeline.svg)](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/-/commits/master)

# @3kles/kles-material-dynamicforms

**kles-material-dynamicforms** is a component library to build `Material Angular Form`.

## Changelog

Check out the [changelog](./CHANGELOG.md) to check all the latest changes.

## KlesDynamicFormComponent
- [`KlesDynamicFormComponent`](docs/readme.md#klesdynamicformcomponent): Component to create form with list of IFieldConfig

## Directives
- [Directives](./docs/directives.md): List of directives
- [`KlesComponentDirective`](./docs/directives.md#klescomponentdirective): Directive to inject component with value
- [`KlesDynamicFieldDirective`](./docs/directives.md#klesdynamicfielddirective): Directive to inject component with IFieldConfig in FormGroup


## Interfaces
- [Interfaces](./docs/interfaces.md): List of interfaces
- [`IFieldConfig`](./docs/interfaces.md#ifieldconfig): List of attribute field
- [`IField`](./docs/interfaces.md#ifield): Composition of IFieldConfig and FormGroup
- [`IValidator`](./docs/interfaces.md#ivalidator): Validator interface

## Fields
- [Fields](./docs/fields.md): List of field to build form
- [`KlesFieldAbstract`](./docs/fields.md#klesfieldabstract): Abstract class to build field component
- [`KlesFormButtonComponent`](./docs/fields.md#klesformbuttoncomponent): Button in form
- [`KlesFormButtonCheckerComponent`](./docs/fields.md#klesFormbuttoncheckercomponent): Button checker to manage checking and error in form
- [`KlesFormCheckboxComponent`](./docs/fields.md#klesformcheckboxcomponent): Checkbox in form
- [`KlesFormChipComponent`](./docs/fields.md#klesformchipcomponent): Chip in form
- [`KlesFormColorComponent`](./docs/fields.md#klesformcolorcomponent): ColorPicker in form
- [`KlesFormDateComponent`](./docs/fields.md#klesformdatecomponent): DatePicker in form
- [`KlesFormGroupComponent`](./docs/fields.md#klesformgroupcomponent): FormGroup in form
- [`KlesFormInputComponent`](./docs/fields.md#klesforminputcomponent): Input in form
- [`KlesFormInputClearableComponent`](./docs/fields.md#klesforminputclearablecomponent): Input clearable in form
- [`KlesFormListFieldComponent`](./docs/fields.md#klesformlistfieldcomponent): List of field in form
- [`KlesFormRadioComponent`](./docs/fields.md#klesformradiocomponent): RadioButton in form
- [`KlesFormSelectComponent`](./docs/fields.md#klesformselectcomponent): Select in form
- [`KlesFormTextComponent`](./docs/fields.md#klesformtextcomponent): Display text in form
- [`KlesFormTextareaComponent`](./docs/fields.md#klesformtextareacomponent): TextArea in form

## Matchers
- [Matchers](./docs/matchers.md): List of matchers
- [`KlesFormErrorStateMatcher`](./docs/matchers.md#klesformerrorstatematcher): Error state matcher for form

## Validators
- [Validators](./docs/validators.md): List of validators
- [`autocompleteObjectValidator`](./docs/validators.md#autocompleteobjectvalidator): Autocomplete object validator
- [`autocompleteStringValidator`](./docs/validators.md#autocompletestringvalidator): Autocomplete string validator
## Install

### npm

```
npm install @3kles/kles-material-dynamicforms --save
```

## How to use

In the module
```javascript
import { KlesMaterialDynamicFormsModule } from '@3kles/kles-material-dynamicforms';
...
@NgModule({
    
 imports: [
    KlesMaterialDynamicFormsModule,
...
 ]

 ...
})
```

Check the [`documentation`](./docs) to use component and directive.

## Tests

```
npm install
npm test
```
## License

[`MIT`](./LICENSE.md)
