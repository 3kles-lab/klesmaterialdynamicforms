<!--[![pipeline status](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/badges/master/pipeline.svg)](http://gitlab.3kles.local/angular/klesmaterialdynamicforms/-/commits/master)-->

# @3kles/kles-material-dynamicforms

**kles-material-dynamicforms** is a component library to build `Material Angular Form`.

## Changelog

Check out the [changelog](./CHANGELOG.md) to check all the latest changes.

## Models

### Submission state

Bind `[submitting]` to a boolean owned by the parent for the duration of the save.
It defaults to `false`. Standard, icon, FAB and mini-FAB buttons whose effective
type is `submit` display a spinner and are disabled while submitting, including
buttons inside visual sections and data-bearing groups. Other button types stay
available. Additional submit events, including keyboard submissions, are ignored.
The form and its buttons expose `aria-busy` while submitting.

```html
<app-kles-dynamic-form
  [fields]="fields"
  [submitting]="saving()"
  (submit)="save($event)"
/>
```

```typescript
readonly saving = signal(false);

readonly fields: IKlesFieldConfig[] = [
  // Other fields...
  { name: 'save', component: KlesFormButtonComponent, buttonType: 'submit', label: 'Save' },
];

async save(value: unknown): Promise<void> {
  if (this.saving()) return;
  this.saving.set(true);
  try {
    await this.service.save(value);
  } catch (error) {
    this.showSaveError(error);
  } finally {
    this.saving.set(false);
  }
}
```

With an Observable, reset the flag with `finalize`. The parent must reset it on
both success and failure; emitting `submit` does not automatically change it.
Submission does not disable Angular controls or modify form values, validation,
dirty/touched flags, or existing disabled states. `form.pending` continues to
represent asynchronous validation, independently of submission.

These four button controls also accept `[loading]` for use outside a dynamic form:
`<kles-button [loading]="saving()" label="Save" />`.
Custom field controls can inject the optional `FORM_SUBMITTING` signal to consume
the nearest form's submission state.

### Advanced CSS Grid layout

Add `layout` to an individual root field to enable CSS Grid automatically.
`direction="grid"` remains available to force it when no field declares a layout.
The defaults are a 12-column grid, no gap, `colSpan: 12`, and `rowSpan: 1`.

```typescript
const fields: KlesFormElement[] = [
  { name: 'firstname', component: KlesFormInputComponent, layout: { colSpan: 6, responsive: { xs: { colSpan: 12 } } } },
  { name: 'lastname', component: KlesFormInputComponent, layout: { colSpan: 6, responsive: { xs: { colSpan: 12 } } } },
  { name: 'email', component: KlesFormInputComponent, layout: { colSpan: 12 } },
];
```

Configure the root with `[layout]="{ columns: 12, gap: '16px' }"`. Structural
`section` and `layoutGroup` elements can contain nested `fields` and establish
independent grids through `layoutConfig`; they do not create Angular form
controls. `layoutGroup` is deliberately distinct from the existing data-bearing
`EnumType.group`. The legacy `row`, `column`, `wrap`, and `EnumType.group` APIs
are unchanged.


### Collapsible sections

Set `collapsible: true` on a section to render a Material expansion panel.
It starts open by default; use `expanded: false` to start closed. Sections
without `collapsible` keep their existing appearance. Panels open and close
independently, including nested sections. Collapsing keeps fields mounted,
so their values, validation, and subscriptions remain active.

```typescript
const fields: KlesFormElement[] = [
  {
    type: 'section',
    title: 'Additional information',
    description: 'Optional details',
    icon: 'info',
    collapsible: true,
    expanded: false,
    fields: [{ name: 'notes', component: KlesFormInputComponent }],
  },
];
```

Use a `ViewChild` reference to open or close every collapsible section, including
nested sections, after the view is initialized:

```typescript
@ViewChild(KlesDynamicFormComponent) dynamicForm!: KlesDynamicFormComponent;

openAll(): void {
  this.dynamicForm.expandAllSections();
}

closeAll(): void {
  this.dynamicForm.collapseAllSections();
}
```

### Updating field configurations

Assign a new `fields` array to synchronize the root form, including fields
inside nested `dynamicFields`, `section` and `layoutGroup` containers. Keep the same
configuration object for an unchanged field; replace the object when its
component configuration changes. Visual containers retain their identity when
the same container object is reused.

Compatible fields retain their control, current value, dirty/touched flags, and
UI state. Compatibility requires the same resolved component and control
factory, `updateOn`, and `nonNullable`. An incompatible field gets a new control
with its declared initial value. Changing `value` on a compatible field does
not overwrite user input; use the control's `setValue` or `patchValue` to do so.

Validator changes and changes to the configured `disabled` flag are applied to
existing controls. An unrelated update preserves programmatic enabling or
disabling. UI defaults that change are patched into the existing leaf state;
unrelated runtime UI adjustments are preserved. Unchanged mounted fields keep
their components, focus, option subscriptions, and `valueChanges` callbacks.
Their injected sibling list reflects additions and removals without a rebuild.

Removed fields lose their controls and UI states. Names must be unique across
all visual containers sharing the root form; duplicates are rejected before
changing controls. Structural updates emit the final form value after
synchronization, without intermediate structural values. Removed or replaced
controls are detached from their old parent. `_onLoaded` still emits after a
new `fields` input has been synchronized.

Recursive removal and schema updates inside data-bearing `EnumType.group`
and arrays are outside this stage. Their existing behavior is retained.

### Dependent child fields: API contract

**Dependency execution and automatic child synchronization are active.**
`dependsOn` and `resolveFields` are optional properties on `dynamicFields`,
`section` and `layoutGroup`. The component observes dependencies, invokes the resolver and
exposes its results through the `fieldResolutions` Signal. Successful results
replace the container's effective children, synchronize controls and UI state,
and render at its position. The supplied `fields` configuration is never mutated.

Use `dynamicFields` for a transparent insertion slot. It creates no visual
wrapper, grid or Angular FormGroup. Its children become siblings of the surrounding
fields, preserving the parent's `row`, `column` or grid layout. Nested slots are
transparent too. Apply `layout` to individual children when grid placement is needed;
these placements enable the root grid just like placements on direct fields.
Static `fields: []` supplies the initial children and may contain fallback fields.
Use `section` or `layoutGroup` when the returned fields need a titled section or
an independent grid. All three variants share the same dependency engine and
belong to the same form group as their static children.

The following configuration inserts the returned fields below the select:

```typescript
import {
  EnumType,
  KlesFormElement,
} from '@3kles/kles-material-dynamicforms';

// dossierService.loadFields returns KlesFormElement[], a Promise, or an Observable.
const fields: KlesFormElement[] = [
  {
    name: 'typeDossier',
    type: EnumType.select,
    options: ['individual', 'company'],
  },
  {
    type: 'dynamicFields',
    fields: [],
    dependsOn: ['typeDossier'],
    resolveFields: ({ values }) => {
      const dossierType = values['typeDossier'];
      return typeof dossierType === 'string' && dossierType
        ? dossierService.loadFields(dossierType)
        : [];
    },
  },
];
```

The resolver receives an `IKlesFormFieldsResolveEvent` containing `element`
(the container), `group` (the root form), `values` (its `getRawValue()` snapshot,
including disabled controls), and `context` (the current external context or
`null`). Use the captured `values` for asynchronous work; `group` remains live.
Treat the snapshot and its nested values as read-only.

The dependency engine follows this execution contract:

- **Dependencies:** paths are relative to the root form, including inside nested
  visual containers. Dot notation such as `address.country` follows Angular
  control paths; wildcards and relative-path syntax are not supported. Empty or
  missing paths and dependency cycles must produce diagnostics instead of
  silently starting a resolver. Resolution waits until every declared control
  exists. Duplicate paths are observed once.
  Cycles are detected from static children and known resolved definitions; names
  that have never been returned cannot be inferred in advance. Unrelated valid
  branches continue to resolve when another branch has a diagnostic.
- **Triggers:** resolve once after the form and declared dependencies are ready,
  then whenever any dependency changes according to `Object.is`. With an omitted
  or empty `dependsOn`, resolve only initially. Object values must be replaced
  to trigger resolution. Changing `context` alone is not a trigger in this first
  contract; existing Signal-based `resolveUi` behavior is separate.
- **Results:** accept `readonly KlesFormElement[]`, a Promise of that array, or an
  Observable of arrays. Each result replaces all container children; results are
  never appended. An empty array removes the children. Static `fields` remains
  required and supplies the initial children. Without `resolveFields`,
  `dependsOn` has no effect.
- **Concurrency and lifetime:** the latest dependency values win. Unsubscribe
  from the previous Observable and ignore obsolete Promise results. Removing a
  container or replacing its resolver/dependencies disposes its resolution;
  a replacement configuration starts a new initial resolution.
- **Loading and errors:** keep the last successful children, or the initial
  `fields`, while waiting. An Observable may emit multiple replacements;
  completion without a result keeps the current children. A synchronous throw,
  rejected Promise, or Observable error keeps the current children and reports
  a diagnostic. A subsequent dependency change can retry. This contract does
  not introduce a loading widget or a submission-blocking policy.
- **Controls:** a result must be synchronized with controls and UI state before
  rendering. Preserve existing values only for compatible controls with the
  same path; remove controls for children that disappear. Child control names
  must be unique within their form group, including across visual containers.
  Invalid results, including duplicate names, retain the last synchronized
  children and produce an `invalid-result` diagnostic. Generated nested visual
  containers can declare their own resolvers; they are registered after their
  controls are ready and disposed when their parent result removes them.

The form builds a separate effective tree, available as `renderedFields`. Input
containers keep their original static `fields`; use `fieldResolutions` to inspect
resolved definitions and `form.getRawValue()` to read the actual submitted data.
Compatible controls retain user input across resolutions even when a new default
`value` is returned. Removed controls and their values leave the form.

This contract leaves `options`, `optionGroups`, `resolveUi`, `validations`,
`asyncValidations`, `valueChanges`, and the one-time `asyncValue` behavior
unchanged. Reusing the dependency engine for those APIs is a later step.

After initialization, inspect an existing container's resolution with a form
reference:

```typescript
const state = dynamicForm.fieldResolutions().get(container);
// state.status: 'waiting' | 'loading' | 'ready' | 'error'
// state.fields: last successful result, or initial fields before the first result
// state.diagnostic: code, message, paths, element and optional underlying error
```

Diagnostics are also reported to the console and repeated identical dependency
diagnostics are suppressed. The engine is refreshed after form configuration
updates and disposed when the form is destroyed. Context is read at each
resolution but does not trigger resolutions by itself.

`KlesFormDependencyEngine` is also exported for standalone use. Construct it with
a root form and optionally a context getter, call `update(elements)` to register
containers or refresh silent control edits, and call `destroy()` when finished.
Its `states` Signal retains outcomes; `resolved$` emits successful arrays and
`diagnostics$` emits diagnostics. It never changes fields or controls itself.

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

Check the [`documentation`](https://doc.3kles-consulting.com/#/material/dynamicforms) to use component and directive.

## Tests

```
npm install
npm test
```
## License

[`MIT`](./LICENSE.md)
