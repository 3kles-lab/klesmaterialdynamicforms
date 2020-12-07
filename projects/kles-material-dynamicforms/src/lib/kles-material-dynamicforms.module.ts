import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form.component';
import { DynamicFieldDirective } from './directive';
import {
  LabelComponent,
  InputComponent, ButtonComponent, SelectComponent, DateComponent, RadioComponent,
  CheckboxComponent, ListFieldComponent, ColorComponent
} from './fields';
import { FormErrorStateMatcher } from './matcher';
import { ErrorStateMatcher } from '@angular/material/core';
import { MaterialModule } from './modules/material.module';
//import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';

const components = [
  DynamicFormComponent,
  LabelComponent,
  InputComponent,
  ButtonComponent,
  SelectComponent,
  DateComponent,
  RadioComponent,
  CheckboxComponent,
  ListFieldComponent,
  ColorComponent
];

const directives = [DynamicFieldDirective];

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
    { provide: ErrorStateMatcher, useClass: FormErrorStateMatcher }
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
