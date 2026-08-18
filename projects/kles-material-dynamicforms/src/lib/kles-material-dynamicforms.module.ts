import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KlesDynamicFormComponent } from './dynamic-form.component';
import { KlesComponentDirective } from './directive/dynamic-component.directive';
import { KlesDynamicFieldDirective } from './directive/dynamic-field.directive';
import { KlesFormErrorStateMatcher } from './matcher/form-error.matcher';
import { ErrorStateMatcher } from '@angular/material/core';
import { MaterialModule } from './modules/material.module';
import { KlesFormLabelComponent } from './fields/label.component';
import { KlesFormInputComponent } from './fields/input.component';
import { KlesFormDateComponent } from './fields/date.component';
import { KlesFormRadioComponent } from './fields/radio.component';
import { KlesFormCheckboxComponent } from './fields/checkbox.component';
import { KlesFormListFieldComponent } from './fields/list-field.component';
import { KlesFormColorComponent } from './fields/color.component';
import { KlesButtonComponent } from './forms/button-control.component';
import { KlesFormButtonComponent } from './fields/button-form.component';
import { KlesButtonCheckerComponent } from './forms/buttonchecker-control.component';
import { KlesFormButtonCheckerComponent } from './fields/buttonchecker-form.component';
import { KlesButtonFileComponent } from './forms/buttonfile-control.component';
import { KlesFormButtonFileComponent } from './fields/buttonfile-form.component';
import { KlesFormTextareaComponent } from './fields/textarea.component';
import { KlesFormTextComponent } from './fields/text.component';
import { KlesFormChipComponent } from './fields/chip.component';
import { KlesFormGroupComponent } from './fields/group.component';
import { KlesFormInputClearableComponent } from './fields/input.clearable.component';
import { KlesFormIconComponent } from './fields/icon.component';
import { KlesTransformPipe } from './pipe/transform.pipe';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { KlesFormLineBreakComponent } from './fields/line-break.component';
import { ArrayFormatPipe } from './pipe/array.pipe';
import { KlesFormLinkComponent } from './fields/link.component';
import { KlesFormSlideToggleComponent } from './fields/slide-toggle.component';
import { KlesFormSelectionListComponent } from './fields/selection-list.component';
import { KlesFormBadgeComponent } from './fields/badge.component';
import { KlesFormButtonToogleGroupComponent } from './fields/button-toogle-group.component';
import { KlesFormArrayComponent } from './fields/array.component';
import { KlesFormRangeComponent } from './fields/range.component';
import { KlesFormClearComponent } from './fields/subfields/clear.component';
import { KlesFormFabComponent } from './fields/button-fab.component';
import { KlesFabComponent } from './forms/fab-control.component';
import { KlesMiniFabComponent } from './forms/mini-fab-control.component';
import { KlesFormMiniFabComponent } from './fields/button-mini-fab.component';
import { KlesIconButtonComponent } from './forms/icon-button-control.component';
import { KlesFormIconButtonComponent } from './fields/button-icon.component';
import { KlesFormSelectionListSearchComponent } from './fields/selection-list.search.component';
import { MatErrorMessageDirective } from './directive/mat-error-message.directive';
import { MatErrorFormDirective } from './directive/mat-error-form.directive';
import { KlesFormCheckboxIndeterminateComponent } from './fields/checkbox-indeterminate.component';
import { KlesIndeterminateCheckboxComponent } from './forms/indeterminate-checkbox';

import { KlesFormFileComponent } from './fields/file.component';
import { KlesFileControlComponent } from './forms/file-control.component';
import { KlesFormDateTimeComponent } from './fields/date-time.component';
import { KlesFormCopyComponent } from './fields/subfields/copy.component';

import { KlesFormActionMenuComponent } from './fields/action-menu.component';
import { KlesFormTileComponent } from './fields/tile.component';
import { KlesFormCurrencyComponent } from './fields/currency.component';
import { KlesFormStatusComponent } from './fields/status.component';
import { KlesFormChipGridComponent } from './fields/chip-grid.component';

const components = [
    KlesDynamicFormComponent,
    KlesFormLabelComponent,
    KlesFormInputComponent,
    KlesFormInputClearableComponent,
    KlesFormBadgeComponent,
    KlesFormFileComponent,
    KlesFileControlComponent,
    KlesButtonComponent,
    KlesFormButtonComponent,
    KlesButtonCheckerComponent,
    KlesFormButtonCheckerComponent,
    KlesButtonFileComponent,
    KlesFormButtonFileComponent,
    KlesFormDateComponent,
    KlesFormDateTimeComponent,
    KlesFormRadioComponent,
    KlesFormCheckboxComponent,
    KlesIndeterminateCheckboxComponent,
    KlesFormCheckboxIndeterminateComponent,
    KlesFormListFieldComponent,
    KlesFormColorComponent,
    KlesFormTextareaComponent,
    KlesFormTextComponent,
    KlesFormChipComponent,
    KlesFormGroupComponent,
    KlesFormIconComponent,
    KlesFormLineBreakComponent,
    KlesFormLinkComponent,
    KlesFormSlideToggleComponent,
    KlesFormSelectionListComponent,
    KlesFormButtonToogleGroupComponent,
    KlesFormArrayComponent,
    KlesFormRangeComponent,
    KlesFormClearComponent,
    KlesFormFabComponent,
    KlesFabComponent,
    KlesMiniFabComponent,
    KlesFormMiniFabComponent,
    KlesIconButtonComponent,
    KlesFormIconButtonComponent,
    KlesFormSelectionListSearchComponent,
    KlesFormCopyComponent,
    KlesFormTileComponent,
    KlesFormActionMenuComponent,
    KlesFormCurrencyComponent,
    KlesFormStatusComponent,
    KlesFormChipGridComponent,
];

const directives = [KlesDynamicFieldDirective, KlesComponentDirective, MatErrorMessageDirective, MatErrorFormDirective];
const pipes = [KlesTransformPipe, ArrayFormatPipe];
@NgModule({
    imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, NgxMatSelectSearchModule, components, directives, pipes],
    providers: [{ provide: ErrorStateMatcher, useClass: KlesFormErrorStateMatcher }, pipes],
    exports: [components, pipes, directives],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class KlesMaterialDynamicformsModule {
    static declarations = [components, directives, pipes];
}
