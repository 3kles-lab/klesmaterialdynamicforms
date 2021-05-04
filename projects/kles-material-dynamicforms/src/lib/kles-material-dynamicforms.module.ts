import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KlesDynamicFormComponent } from './dynamic-form.component';
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
import { KlesButtonCheckerComponent } from './forms/buttonchecker-control.component';
import { KlesFormButtonComponent } from './fields/button-form.component';
import { KlesFormButtonCheckerComponent } from './fields/buttonchecker-form.component';
import { KlesFormTextareaComponent } from './fields/textarea.component';

const components = [
  KlesDynamicFormComponent,
  KlesFormLabelComponent,
  KlesFormInputComponent,
  KlesFormSubmitButtonComponent,
  KlesButtonComponent,
  KlesFormButtonComponent,
  KlesButtonCheckerComponent,
  KlesFormButtonCheckerComponent,
  KlesFormSelectComponent,
  KlesFormDateComponent,
  KlesFormRadioComponent,
  KlesFormCheckboxComponent,
  KlesFormListFieldComponent,
  KlesFormColorComponent,
  KlesFormTextareaComponent
];

const directives = [KlesDynamicFieldDirective];

@NgModule({
  declarations: [
    components,
    directives,

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FlexLayoutModule,
    FormsModule,
    MaterialModule,
    ColorPickerModule
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
