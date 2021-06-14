import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KlesDynamicFormComponent } from './dynamic-form.component';
import { KlesComponentDirective } from './directive/dynamic-component.directive';
import { KlesDynamicFieldDirective } from './directive/dynamic-field.directive';
import { KlesFormErrorStateMatcher } from './matcher/form-error.matcher';
import { ErrorStateMatcher } from '@angular/material/core';
import { MaterialModule } from './modules/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';
import { KlesFormLabelComponent } from './fields/label.component';
import { KlesFormInputComponent } from './fields/input.component';
import { KlesFormSubmitButtonComponent } from './fields/button-submit.component';
import { KlesFormSelectComponent } from './fields/select.component';
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
import { KlesFormSelectSearchComponent } from './fields/select.search.component';
import { ArrayFormatPipe } from './pipe/array.pipe';


const components = [
  KlesDynamicFormComponent,
  KlesFormLabelComponent,
  KlesFormInputComponent,
  KlesFormInputClearableComponent,
  KlesFormSubmitButtonComponent,
  KlesButtonComponent,
  KlesFormButtonComponent,
  KlesButtonCheckerComponent,
  KlesFormButtonCheckerComponent,
  KlesButtonFileComponent,
  KlesFormButtonFileComponent,
  KlesFormSelectComponent,
  KlesFormDateComponent,
  KlesFormRadioComponent,
  KlesFormCheckboxComponent,
  KlesFormListFieldComponent,
  KlesFormColorComponent,
  KlesFormTextareaComponent,
  KlesFormTextComponent,
  KlesFormChipComponent,
  KlesFormGroupComponent,
  KlesFormIconComponent,
  KlesFormSelectSearchComponent
];

const directives = [KlesDynamicFieldDirective, KlesComponentDirective];
const pipes = [KlesTransformPipe, ArrayFormatPipe];

@NgModule({
  declarations: [
    components,
    directives,
    pipes

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FlexLayoutModule,
    FormsModule,
    MaterialModule,
    ColorPickerModule,
    NgxMatSelectSearchModule
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: KlesFormErrorStateMatcher }
  ],
  entryComponents: [
    components
  ],
  exports: [
    components,
    directives,
    ColorPickerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class KlesMaterialDynamicformsModule { }
