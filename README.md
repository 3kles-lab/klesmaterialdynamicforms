<!--[![pipeline status](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/badges/master/pipeline.svg)](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/-/commits/master)-->

# @3kles/kles-material-dynamicforms

**kles-material-dynamicforms** is a component library to build `Material Angular Form`.

## Changelog

Check out the [changelog](./CHANGELOG.md) to check all the latest changes.

## Models


### Directives

- <b>KlesComponentDirective</b> -> Directive to inject component with value
- <b>KlesDynamicFieldDirective</b> -> Directive to inject component with IFieldConfig in FormGroup

### Interfaces

#### IKlesFieldConfig

Interface field model

- <b>type?</b>: string -> Mapper type if(type && !component)=>type
- <b>name</b>: string -> Name Field (key for FormControlName)
- <b>component?</b>: Type\<any> -> Component field
- <b>id?</b>: string -> Attribut html id
- <b>label?</b>: string -> Label field
- <b>placeholder?</b>: string -> Placeholder field
- <b>tooltip?</b>: string -> Tooltip field
- <b>inputType?</b>: string -> Input type
- <b>min?</b>: number | Date -> Min value for number input or date field
- <b>max?</b>: number | Date -> Max value for number input or date field
- <b>maxLength?</b>: number -> Max length for input value
- <b>step?</b>: number -> Define a step for number input
- <b>options?</b>: any[] | Subject\<any[]> | Observable\<any[]> | ((value?: string) => Observable\<any[]>) -> List options for list component
- <b>ngClass?</b>: any -> ngclass for field
- <b>ngStyle?</b>: any -> ngStyle for field
- <b>property?</b>: string -> Property for field
- <b>collections?</b>: any -> Collections for subfield
- <b>value?</b>: any -> Value field
- <b>asyncValue?</b>: Observable\<any> -> Async value field
- <b>multiple?</b>: boolean -> Multiple selection field
- <b>disabled?</b>: boolean -> Disabled field
- <b>autocomplete?</b>: boolean -> Autocomplete input field
- <b>autocompleteComponent?</b>: Type<\any> -> Autocomplete component to display in list option
- <b>displayWith?</b>: ((value: any) => string) | null -> Autocomplete display format
- <b>panelWidth?</b>: string | number -> Width for panel list option
- <b>indeterminate?</b>: boolean -> Indeterminate checkable component
- <b>color?</b>: string -> Material color
- <b>icon?</b>: string -> Material icon
- <b>iconSvg?</b>: string -> Svg icon
- <b>textareaAutoSize?</b>: { minRows?: number; maxRows?: number } -> Define a min and max number of rows for text area
- <b>validations?</b>: IKlesValidator\<ValidatorFn>[] -> Array of validators for a field
- <b>asyncValidations?</b>: IKlesValidator\<AsyncValidatorFn>[] -> Array of async validators for a field
- <b>pipeTransform?</b>: {
    pipe: PipeTransform,
    options?: any[]
}[] -> Array of pipe to apply to value field
- <b>direction?</b>: 'row' | 'column' -> Direction for the display of the fields
- <b>valueChanges?</b>: ((field: IKlesFieldConfig, group: UntypedFormGroup, siblingField?: IKlesFieldConfig[], valueChanged?: any) => void) -> Emit each time the value is changing
- <b>triggerComponent?</b>: Type\<any> -> Trigger component to customize trigger label in select
- <b>virtualScroll?</b>: boolean -> To activate virtual scroll
- <b>itemSize?</b>: number -> Item size for virtual scroll
- <b>pending?</b>: boolean -> If the value is pending
- <b>searchKeys?</b>: string[] -> List of keys for multiple searches
- <b>updateOn?</b>: 'change' | 'blur' | 'submit' -> Set the update on diferent moment
- <b>debounceTime?</b>: number -> Time in milliseconds before emit value after changed
- <b>directive?</b>: (new (ref: ViewContainerRef, field: IKlesField) => IKlesDirective) -> Set a new directive to the field
- <b>visible?</b>: boolean -> Set if the field is visible
- <b>lazy?</b>: boolean -> Set if the field is lazy
- <b>buttonType?</b>: 'submit' | 'button' | 'reset' -> Define the type of a button
- <b>accept?</b>: string ->
- <b>dateOptions?</b>: {
        adapter?: {
            class: Type<DateAdapter\<any>>,
            deps?: any[]
        },
        language: string,
        dateFormat: MatDateFormats
    } -> Define options for date field
- <b>hint?</b>: string -> Display as a mat-hint for the field
- <b>clearable?</b>: boolean -> Display a cross to clear the field
- <b>clearableComponent?</b>: Type\<any> -> Define a new clearable component
- <b>subComponents?</b>: Type\<any>[] -> Define sub components of a field
- <b>autofocus?</b>: boolean -> Set the autofocus on the field
- <b>attribute?</b>: EnumButtonAttribute -> To display material button design
- <b>subscriptSizing?</b>: SubscriptSizing ->
- <b>nonNullable?</b>: boolean -> Set if the field can  be null

### Fields

- <b>KlesFormArrayComponent</b> component that creates a form array of other components
- <b>KlesFormBadgeComponent</b> component to display a badge
- <b>KlesFormFabComponent</b> component to display a fab button
- <b>KlesFormButtonComponent</b> component to display a button
- <b>KlesFormIconButtonComponent</b> component to display an icon button
- <b>KlesFormMiniFabComponent</b> component to display a mini fab button
- <b>KlesFormButtonToogleGroupComponent</b> component to display a button group toggle
- <b>KlesFormButtonCheckerComponent</b> component to check error in form
- <b>KlesFormButtonFileComponent</b> button that take a file
- <b>KlesFormCheckboxComponent</b> component to display a checkbox
- <b>KlesFormChipComponent</b> component to display a chip
- <b>KlesFormClearComponent</b> component to clear a form
- <b>KlesFormColorComponent</b> component to select a color
- <b>KlesFormDateTimeComponent</b> component to select a date with a time
- <b>KlesFormDateComponent</b> component to select a date
- <b>KlesFieldAbstract</b> abstract class to build field component
- <b>KlesFormGroupComponent</b> component that creates a form group of other components
- <b>KlesFormIconComponent</b> component to display a material icon
- <b>KlesFormInputClearableComponent</b> component with an input that is clearable
- <b>KlesFormInputComponent</b> component with an input
- <b>KlesFormLineBreakComponent</b> component to go to the next line
- <b>KlesFormLinkComponent</b> component that display a link
- <b>KlesFormListFieldComponent</b> component to display a list
- <b>KlesFormRadioComponent</b> component that display a material radio
- <b>KlesFormRangeComponent</b> component to select a date range
- <b>KlesFormSelectComponent</b> component to select a value in options
- <b>KlesFormSelectLazySearchComponent</b> component to select in lazy options that can be filtered
- <b>KlesFormSelectSearchComponent</b> component to select a value in options that can be filtered
- <b>KlesFormSelectionListComponent</b> component to create a list with elements that can be selected
- <b>KlesFormSelectionListSearchComponent</b> component to create a list with elements that can be selected and filtered
- <b>KlesFormSlideToggleComponent</b> component to display a group toggle
- <b>KlesFormTextComponent</b> component to display text
- <b>KlesFormTextareaComponent</b> component to display a text area

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

Check the [`documentation`](https://doc.3kles-consulting.com) to use component and directive.

## Tests

```
npm install
npm test
```
## License

[`MIT`](./LICENSE.md)
