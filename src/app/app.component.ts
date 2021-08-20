import { PropertyPipe } from '@3kles/kles-ng-pipe';
import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  IButton, IButtonChecker, IKlesFieldConfig, IKlesValidator, KlesDynamicFormComponent,
  KlesFormButtonCheckerComponent, KlesFormButtonComponent, KlesFormButtonFileComponent, KlesFormCheckboxComponent, KlesFormChipComponent,
  KlesFormColorComponent,
  KlesFormIconComponent,
  KlesFormInputComponent, KlesFormLabelComponent, KlesFormSelectionListComponent, KlesFormTextareaComponent, KlesFormTextComponent,
} from 'kles-material-dynamicforms';
import { autocompleteObjectValidator, autocompleteStringValidator, KlesFormInputClearableComponent, KlesFormSelectComponent, KlesFormSelectSearchComponent } from 'projects/kles-material-dynamicforms/src/public-api';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { SelectOptionComponent } from './select/select-option.component';
import { SelectTriggerComponent } from './select/select-trigger.component';

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
export class AppComponent implements OnInit, AfterViewInit {
  title = 'KlesMaterialDynamicForms';

  @ViewChild('form', { static: false }) form: KlesDynamicFormComponent;
  fields: IKlesFieldConfig[] = [];
  formValidators: IKlesValidator<ValidatorFn>[] = [];

  @ViewChild('formText', { static: false }) formText: KlesDynamicFormComponent;
  fieldsText: IKlesFieldConfig[] = [];
  formValidatorsText: IKlesValidator<ValidatorFn>[] = [];

  @ViewChild('formInput', { static: false }) formInput: KlesDynamicFormComponent;
  fieldsInput: IKlesFieldConfig[] = [];
  formValidatorsInput: IKlesValidator<ValidatorFn>[] = [];

  @ViewChild('formButton', { static: false }) formButton: KlesDynamicFormComponent;
  fieldsButton: IKlesFieldConfig[] = [];
  formValidatorsButton: IKlesValidator<ValidatorFn>[] = [];
  colorVariable = "#00FF00";

  constructor(private _adapter: DateAdapter<any>, private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'excel',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/excel.svg')
    );

    const decPipe = new DecimalPipe('fr-FR');
    const val = decPipe.transform(10.467, '1.2-2');
    console.log('Val=', val);
  }

  ngOnInit() {
    //Button Form
    this.buildButtonForm();

    //Form
    this.buildForm();

    //Text Form
    this.buildTextForm();

    //Input Form
    this.buildInputForm();
  }

  ngAfterViewInit(): void {

    Object.keys(this.formButton.form.controls).forEach(e => {
      console.log('FormButton ', e, '=', this.formButton.form.controls[e]);
    })

    // this.formButton.form.controls['buttonfile'].valueChanges.subscribe(s => {
    //   console.log('Button file changed=', s);
    // });

    this.formButton.form.valueChanges.subscribe(s => {
      console.log('Button changed=', s);
      const val = Object.keys(s).find(f => s[f]);
      console.log(val);
      if (val) {
        this.formButton.form.reset();
      }
    })

    this.form.form.valueChanges.subscribe(s => {
      console.log('Group changed=', this.form, ' with value=', s);
    })


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

  buildForm() {
    this.fields.push({
      component: KlesFormChipComponent,
      name: 'chip',
      value: 'chip'
    });

    this.fields.push({
      component: KlesFormIconComponent,
      name: 'icon',
      value: 'dns',
      // color: 'accent'
      ngStyle: {
        color: this.colorVariable
      }
    });

    this.fields.push({
      component: KlesFormColorComponent,
      name: 'color',
      value: 'red',
    });

    this.fields.push({
      component: KlesFormSelectionListComponent,
      name: 'selectionList',
      multiple: true,
      options: of([...Array(500).keys()]) as Subject<any>
    });

    this.fields.push(
      {
        type: 'group',
        name: 'environment',
        direction: 'column',
        collections: [
          {
            name: 'key',
            value: 'KeyCRUD',
            component: KlesFormTextComponent,
          } as IKlesFieldConfig,
          {
            type: 'group',
            name: 'crud',
            direction: 'row',
            collections: [
              {
                component: KlesFormCheckboxComponent,
                name: 'read',
                label: 'read.text',
                tooltip: 'read.text',
              },
              {
                component: KlesFormCheckboxComponent,
                name: 'create',
                label: 'create.text',
                tooltip: 'create.text',

              },
              {
                component: KlesFormCheckboxComponent,
                name: 'delete',
                label: 'delete.text',
                tooltip: 'delete.text',
              },
              {
                component: KlesFormCheckboxComponent,
                name: 'update',
                label: 'update.text',
                tooltip: 'update.text',
              }
            ]
          }
        ]
      }
    )
  }

  buildTextForm() {
    this.fieldsText.push({
      name: 'text',
      placeholder: 'Text',
      inputType: 'text',
      tooltip: 'tooltip text',
      value: 'text value',
      component: KlesFormTextComponent,
    });
    this.fieldsText.push({
      name: 'text',
      placeholder: 'Text',
      inputType: 'text',
      tooltip: 'tooltip text',
      value: 'text value',
      component: KlesFormTextareaComponent,
    });
  }

  buildInputForm() {

    this.fieldsInput.push({
      name: 'inputtext',
      placeholder: 'Input Text',
      inputType: 'text',
      tooltip: 'tooltip text',
      value: 'input text value',
      component: KlesFormInputComponent,
      valueChanges: (field, group, siblingFields) => {
        if (group.controls[field.name].value === 'test') {
          console.log('on rentre ici');
          (siblingFields.find(sibling => sibling.name === 'selectTest').options as BehaviorSubject<string[]>).next(['ccc', 'dddd']);
        }
      }
    });

    this.fieldsInput.push({
      name: 'inputtextmax',
      placeholder: 'Input Text MaxLength',
      inputType: 'text',
      tooltip: 'tooltip text',
      maxLength: 10,
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
      ]
    });

    this.fieldsInput.push({
      name: 'inputobj',
      placeholder: 'Input Object',
      inputType: 'text',
      tooltip: 'tooltip object',
      value: {
        usid: "USID",
        name: "Name"
      },
      component: KlesFormInputComponent,
      pipeTransform: [
        {
          pipe: new PropertyPipe(),
          options: ['usid']
        },
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
      name: 'selectTest',
      placeholder: 'select multiple',
      component: KlesFormSelectSearchComponent,
      property: 'BUAR',
      triggerComponent: SelectTriggerComponent,
      autocompleteComponent: SelectOptionComponent,
      multiple: true,
      options: new BehaviorSubject<any[]>([{ BUAR: 'A', TX40: 'aaaa' }, { BUAR: 'C', TX40: 'bbb' }])
      // options: of(['aaa', 'bbb'])
    });

    this.fieldsInput.push({
      name: 'selectTestSimple',
      placeholder: 'select simple',
      component: KlesFormSelectComponent,
      property: 'BUAR',
      autocompleteComponent: SelectOptionComponent,
      options: new BehaviorSubject<any[]>([{ BUAR: 'A', TX40: 'aaaa' }, { BUAR: 'C', TX40: 'bbb' }])
      // options: of(['aaa', 'bbb'])
    });


    this.fieldsInput.push({
      component: KlesFormInputComponent,
      placeholder: 'autocomplete mandatory with object array',
      name: 'autocompleteWithobjectMandatory',
      autocomplete: true,
      autocompleteComponent: AutocompleteComponent,
      maxLength: 3,
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
      maxLength: 3,
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

    this.fieldsButton.push({
      component: KlesFormButtonFileComponent,
      name: 'buttonfile',
      label: 'Choose file',
      color: 'accent',
      iconSvg: 'excel',
      ngClass: 'mat-raised-button',
      tooltip: 'tooltip button',
    });
  }

  french() {
    this._adapter.setLocale('fr');
  }
}
