import { RoundPipe } from '@3kles/kles-ng-pipe';
import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  IButton, IButtonChecker, IKlesFieldConfig, IKlesValidator, KlesDynamicFormComponent,
  KlesFormButtonCheckerComponent, KlesFormButtonComponent, KlesFormChipComponent,
  KlesFormInputComponent, KlesFormLabelComponent, KlesFormTextareaComponent, KlesFormTextComponent,
} from 'kles-material-dynamicforms';
import { autocompleteObjectValidator, autocompleteStringValidator, KlesFormInputClearableComponent } from 'projects/kles-material-dynamicforms/src/public-api';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class AppComponent implements AfterViewInit {
  @ViewChild(KlesDynamicFormComponent, { static: false }) form: KlesDynamicFormComponent;
  @ViewChild(KlesDynamicFormComponent, { static: false }) formInput: KlesDynamicFormComponent;
  @ViewChild(KlesDynamicFormComponent, { static: false }) formButton: KlesDynamicFormComponent;
  title = 'KlesMaterialDynamicForms';

  item = { error: [] };
  fields: IKlesFieldConfig[] = [];
  formValidators: IKlesValidator<ValidatorFn>[] = [];

  fieldsInput: IKlesFieldConfig[] = [];
  formValidatorsInput: IKlesValidator<ValidatorFn>[] = [];

  fieldsButton: IKlesFieldConfig[] = [];
  formValidatorsButton: IKlesValidator<ValidatorFn>[] = [];

  fieldTest = {
    name: 'matbutton',
    label: 'mat button',
    color: 'accent',
    icon: 'clear',
    ngClass: 'mat-button',
    tooltip: 'tooltip button'
  };

  formTest: FormGroup=new FormGroup({
    matbutton: new FormControl()
 });


  constructor(private _adapter: DateAdapter<any>, private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'excel',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/excel.svg')
    );

    const decPipe = new DecimalPipe('fr-FR');
    const val = decPipe.transform(10.467, '1.2-2');
    console.log('Val=', val);

    //Label
    this.fields.push({
      component: KlesFormTextComponent,
      name: 'label',
      value: 'Label Value'
    });

    this.fields.push({
      component: KlesFormChipComponent,
      name: 'chip',
      value: 'chip'
    })

    //Input Form
    this.buildInputForm();


    //Button Form
    this.buildButtonForm();

    this.formValidators = [
      // {
      //   name: 'overlap',
      //   validator: this.checkOverlaping('beginvalue', 'endvalue'),
      //   message: 'statusSettings.validator.overlap'
      // },
      // {
      //   name: 'beginend',
      //   validator: this.checkBeginEndValue('beginvalue', 'endvalue'),
      //   message: 'statusSettings.validator.beginend'
      // },

    ];

  }
  ngAfterViewInit(): void {
    console.log('Form=', this.form.form);
    // this.form.form.valueChanges.subscribe(s => {
    //   console.log('Value change=', s);
    //   console.log('Change form=', this.form.form);
    // });


    // this.form.form.controls['input'].valueChanges.subscribe(s => {
    //   console.log('Input change=', s);

    //   const currentButtonValue: IButton = {
    //     uiButton: {
    //       label: 'LOL'
    //     }
    //   }
    //   console.log('Current Button Value=', currentButtonValue);
    //   this.form.form.controls['button'].patchValue(currentButtonValue);


    //   const currentCheckerButtonValue: IButtonChecker = {
    //     busy: false,
    //     error: [{}, {}, {}],
    //     uiButton: {
    //       label: 'LOL'
    //     }
    //   }
    //   this.form.form.controls['#checker'].patchValue(currentCheckerButtonValue);
    // });

    // this.form.form.controls['button'].valueChanges.subscribe(s => {
    //   console.log('Button change=', s);
    // });
  }

  buildInputForm() {
    this.fieldsInput.push({
      name: 'inputtext',
      placeholder: 'Input Text',
      inputType: 'text',
      tooltip: 'tooltip text',
      value: 'input text value',
      component: KlesFormInputComponent,
    });

    this.fieldsInput.push({
      name: 'inputnumber',
      placeholder: 'Input Number',
      inputType: 'number',
      tooltip: 'tooltip number',
      value: 10.463,
      component: KlesFormTextComponent,
      pipeTransform: [
        {
          pipe: new DecimalPipe('fr-FR'),
          options: ['1.2-2']
        },
        // {
        //   pipe: new RoundPipe(),
        //   options: [2]
        // }
      ]
    });

    this.fieldsInput.push({
      name: 'inputclear',
      placeholder: 'Input clearable',
      inputType: 'text',
      tooltip: 'tooltip input clear',
      value: 'input clearable',
      component: KlesFormInputClearableComponent,
    });


    this.fieldsInput.push({
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
    });

    this.fieldsInput.push({
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
    });

    this.fieldsInput.push({
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
    });

    this.fieldsInput.push({
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
    });

    this.fieldsInput.push({
      component: KlesFormTextareaComponent,
      placeholder: 'textarea',
      textareaAutoSize: {
        minRows: 10
      },
      name: 'textarea'
    });
  }

  buildButtonForm() {
    this.fieldsButton.push({
      name: 'matbutton',
      label: 'mat button',
      color: 'accent',
      icon: 'clear',
      ngClass: 'mat-button',
      tooltip: 'tooltip button',
      component: KlesFormButtonComponent,
    });

    this.fieldsButton.push({
      name: 'buttonraised',
      label: 'mat raised button',
      color: 'accent',
      icon: 'clear',
      ngClass: 'mat-raised-button',
      tooltip: 'tooltip button',
      component: KlesFormButtonComponent,
    });

    this.fieldsButton.push({
      name: 'buttonflat',
      label: 'mat flat button',
      color: 'accent',
      icon: 'clear',
      ngClass: 'mat-flat-button',
      tooltip: 'tooltip button',
      component: KlesFormButtonComponent,
    });

    this.fieldsButton.push({
      name: 'buttonstroked',
      label: 'mat stroked button',
      color: 'accent',
      iconSvg: 'excel',
      ngClass: 'mat-stroked-button',
      tooltip: 'tooltip button',
      component: KlesFormButtonComponent,
    });

    this.fieldsButton.push({
      name: 'buttonmini',
      color: 'accent',
      icon: 'add',
      ngClass: 'mat-mini-fab',
      tooltip: 'tooltip button',
      component: KlesFormButtonComponent,
    });

    this.fieldsButton.push({
      name: 'buttonprimary',
      color: 'primary',
      icon: 'delete',
      ngClass: 'mat-mini-fab',
      tooltip: 'tooltip button',
      component: KlesFormButtonComponent,
    });

    this.fieldsButton.push({
      component: KlesFormButtonCheckerComponent,
      name: 'checkerbusy',
      value: { busy: true, message: 'Checking...' }
    });

    this.fieldsButton.push({
      component: KlesFormButtonCheckerComponent,
      name: 'checkererror',
      label: 'View error',
      color: 'warning',
      icon: 'clear',
      ngClass: 'mat-raised-button',
      tooltip: 'tooltip button',
      value: { error: [{}, {}] }
    });

  }

  checkBeginEndValue(begin: string, end: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control) { return null; }
      const beginControl = control.get(begin);
      const endControl = control.get(end);
      if (!beginControl.value || !endControl.value) {
        return null;
      }

      if (Number(beginControl.value) >= Number(endControl.value)) {
        return { beginend: true };
      }

      return null;
    };
  }

  checkOverlaping(begin: string, end: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control) { return null; }
      const beginControl = control.get(begin);
      const endControl = control.get(end);
      if (!beginControl.value || !endControl.value) {
        return null;
      }
      let value = null;
      /*
      this.allData.forEach(line => {
        if ((Number(line.beginvalue) <= Number(beginControl.value) && Number(beginControl.value) < Number(line.endvalue)) ||
          (Number(line.beginvalue) < Number(endControl.value) && Number(endControl.value) < Number(line.endvalue))
        ) {
          console.log('Error');
          value = { overlap: true };
        }
      });
      */

      return value;
    };
  }

  french() {
    this._adapter.setLocale('fr');
  }
}
