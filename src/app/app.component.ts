import { PropertyPipe } from '@3kles/kles-ng-pipe';
import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { EnumType, KlesFormDateComponent, KlesFormRangeComponent } from 'kles-material-dynamicforms';
import {
  IButton, IButtonChecker, IKlesFieldConfig, IKlesValidator, KlesDynamicFormComponent,
  KlesFormButtonCheckerComponent, KlesFormButtonComponent, KlesFormButtonFileComponent, KlesFormCheckboxComponent, KlesFormChipComponent,
  KlesFormColorComponent,
  KlesFormIconComponent,
  KlesFormInputComponent, KlesFormLabelComponent, KlesFormSelectionListComponent, KlesFormTextareaComponent, KlesFormTextComponent,
} from 'kles-material-dynamicforms';
import { KlesFormButtonToogleGroupComponent } from 'kles-material-dynamicforms';
import { autocompleteObjectValidator, autocompleteStringValidator, KlesButtonComponent, KlesFormInputClearableComponent, KlesFormSelectComponent, KlesFormSelectSearchComponent } from 'projects/kles-material-dynamicforms/src/public-api';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { delay, map, shareReplay } from 'rxjs/operators';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { PeekABooDirective } from './directives/test.directive';
import { SelectOptionComponent } from './select/select-option.component';
import { SelectTriggerComponent } from './select/select-trigger.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
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

  options2 = [...Array(10000).keys()];

  warehouseList = [
    // { WHLO: 100, test: 100 },
    // { WHLO: 200, test: 200 },
    // { WHLO: 300, test: 300 },
    // { WHLO: 400, test: 400 },
    // { WHLO: 500, test: 500 },
    // { WHLO: 600, test: 600 },
    // { WHLO: 700, test: 700 }
  ];

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

    this.warehouseList = this.options2.map((o) => { return { WHLO: o, test: o }; });

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


    // setTimeout((() => {
    //   console.log('AAA!!!');
    //   this.formInput?.form?.controls?.testSelectGino?.setValue(this.warehouseList[4], { onlySelf: true, emitEvent: false });
    // }).bind(this), 3000);

    // setTimeout((() => {
    //   console.log('BBB!!!');
    //   const value = this.formInput?.form?.controls?.testSelectGino?.value;
    //   this.formInput?.form?.controls?.testSelectGino2?.setValue(value, { onlySelf: true, emitEvent: false });
    // }).bind(this), 5000);

    this.formInput.form.valueChanges.subscribe(value => console.log(this.formInput.form));
    this.formInput.form.statusChanges.subscribe(value => console.log('status',this.formInput.form));

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
        type: EnumType.group,
        name: 'environment',
        direction: 'column',
        ngClass: 'group-block',
        collections: [
          {
            component: KlesFormInputClearableComponent,
            name: 'read',
            label: 'read.text',
            tooltip: 'read.text',
          },
          {
            component: KlesFormInputClearableComponent,
            name: 'create',
            label: 'create.text',
            tooltip: 'create.text',

          },
          {
            component: KlesFormInputClearableComponent,
            name: 'delete',
            label: 'delete.text',
            tooltip: 'delete.text',
          },
          {
            component: KlesFormInputClearableComponent,
            name: 'update',
            label: 'update.text',
            tooltip: 'update.text',
          }
          // {
          //   name: 'key',
          //   value: 'KeyCRUD',
          //   component: KlesFormTextComponent,
          // } as IKlesFieldConfig,
          // {
          //   type: 'group',
          //   name: 'crud',
          //   direction: 'column',
          //   collections: [
          //     {
          //       component: KlesFormInputClearableComponent,
          //       name: 'read',
          //       label: 'read.text',
          //       tooltip: 'read.text',
          //     },
          //     {
          //       component: KlesFormInputClearableComponent,
          //       name: 'create',
          //       label: 'create.text',
          //       tooltip: 'create.text',

          //     },
          //     {
          //       component: KlesFormInputClearableComponent,
          //       name: 'delete',
          //       label: 'delete.text',
          //       tooltip: 'delete.text',
          //     },
          //     {
          //       component: KlesFormInputClearableComponent,
          //       name: 'update',
          //       label: 'update.text',
          //       tooltip: 'update.text',
          //     }
          //   ]
          // }
        ]
      }
    )

    this.fields.push(
      {
        type: EnumType.array,
        name: 'arrayField',
        value: [{ firstElement: 'aaa', secondElement: 'bbb' }, { firstElement: 'cccc' }],
        collections: [
          {
            component: KlesFormInputComponent,
            name: 'firstElement',
            placeholder: 'firstElement',
            value: 'aaaa'
          },
          {
            component: KlesFormInputComponent,
            name: 'secondElement',
            placeholder: 'secondElement'
          },
          {
            component: KlesFormButtonComponent,
            name: 'matbutton',
            label: 'mat button',
            color: 'accent',
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
      value: 'ici la directive',
      component: KlesFormTextComponent,
      directive: PeekABooDirective
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
      // value: 'input text value',
      asyncValue: of(null).pipe(delay(5000)),
      validations: [{
        validator: Validators.required,
        name:'required',
        message:'fsdfdsfdsf'
      }],
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
      name: 'inputcleardisabled',
      placeholder: 'Input clearable disabled',
      inputType: 'text',
      tooltip: 'tooltip input clear disabled',
      value: 'input clearable disabled',
      disabled: true,
      component: KlesFormInputClearableComponent,
    });

    const toto = [{ BUAR: 'A', TX40: 'aaaa' }, { BUAR: 'C', TX40: 'bbb' }];

    this.fieldsInput.push({
      name: 'selectTest',
      placeholder: 'select multiple',
      component: KlesFormSelectSearchComponent,
      property: 'BUAR',
      triggerComponent: SelectTriggerComponent,
      autocompleteComponent: SelectOptionComponent,
      multiple: true,
      lazy: true,
      virtualScroll: true, value: [toto[0]],
      options: new BehaviorSubject<any[]>(toto)
        .pipe(delay(1000), shareReplay(1))
      // options: of(['aaa', 'bbb'])
    });

    const options = [...Array(10000).keys()];
    const optionsTest = [{ SUNO: 'aaa' }, { SUNO: 'vbbb' }, { SUNO: 'ccc' }]

    this.fieldsInput.push({
      name: 'date',
      placeholder: 'date',
      hint: 'test',
      component: KlesFormDateComponent,
      clearable: true,
      dateOptions: {
        language: 'fr-FR',

        dateFormat: {
          parse: {
            dateInput: 'DD/MM/YYYY',
          },
          display: {
            dateInput: 'MM/YYYY/DD',
            monthYearLabel: 'MMM YYYY',
            dateA11yLabel: 'MM/YYYY/DD',
            monthYearA11yLabel: 'MMM YYYY',
          }

        }
      }
    });

    this.fieldsInput.push({
      name: 'range',
      placeholder: { start: 'debut', end: 'fin' },
      type: EnumType.range,
      clearable: true,
      label: 'Enter a date range',
    });


    const obs$ = of(Array.from(Array(100).keys()).map((val) => ( val)))

    this.fieldsInput.push({
      name: 'selectInfinite',
      placeholder: 'select search infinite iciii',
      // component: KlesFormSelectComponent,
      component: KlesFormSelectSearchComponent,
      // multiple: true,
      // virtualScroll: false,
      options: ['aaaa'],
      // asyncValue: of(0),
     
      // property: 'key',
      // property: 'STKY',
      // options: new BehaviorSubject<any[]>(optionsTest).pipe(delay(1000)),
      // // value: 'aaa',
      // lazy: true,
      // options: of(['aaa', 'bbb'])
    });

    this.fieldsInput.push({
      name: 'selectTestSimple',
      placeholder: 'select simple',
      component: KlesFormSelectComponent,
      // component: KlesFormSelectComponent,
      property: 'BUAR',
      autocompleteComponent: SelectOptionComponent,
      lazy: true,
      value: toto[0],
      // options: toto
      options: new BehaviorSubject<any[]>(toto).pipe(delay(2000), shareReplay(1))
      // options: [{ BUAR: 'A', TX40: 'aaaa' }, { BUAR: 'C', TX40: 'bbb' }]
      // options: of(['aaa', 'bbb'])
    });

    this.fieldsInput.push({
      name: 'selectSearchMultipleKey',
      placeholder: 'select search with multiple key',
      component: KlesFormSelectSearchComponent,
      searchKeys: ['BUAR', 'TX40'],
      property: 'BUAR',
      clearable: true,
      autocompleteComponent: SelectOptionComponent,
      options: new BehaviorSubject<any[]>([{ BUAR: 'A', TX40: 'aaaa' }, { BUAR: 'C', TX40: 'bbb' }])
      // options: of(['aaa', 'bbb'])
    });

    this.fieldsInput.push({
      name: 'testSelectGino',
      placeholder: 'TEST SELECT GINO',
      component: KlesFormSelectComponent,
      autocompleteComponent: AutocompleteComponent,
      // multiple: true,
      virtualScroll: true,
      // options: this.warehouseList,
      options: new BehaviorSubject<any[]>(this.warehouseList),
      value: null,
      property: 'WHLO',
      valueChanges: (field, group, siblingField, valueChanged) => {
        group?.controls?.testSelectGino2?.setValue(valueChanged, { onlySelf: true, emitEvent: true });
      },
      // options: of(['aaa', 'bbb'])
    });

    this.fieldsInput.push({
      name: 'testSelectGino2',
      placeholder: 'TEST SELECT GINO',
      component: KlesFormSelectComponent,
      autocompleteComponent: AutocompleteComponent,
      // multiple: true,
      virtualScroll: true,
      // options: this.warehouseList,
      options: new BehaviorSubject<any[]>(this.warehouseList),
      value: null,
      property: 'WHLO',
      // options: of(['aaa', 'bbb'])
    });

    this.fieldsInput.push({
      name: 'selectTestSimpleInfinite',
      placeholder: 'select simple infinite',
      component: KlesFormSelectComponent,
      multiple: true,
      virtualScroll: true,
      options: options,
      value: [options[9999]]
      // options: of(['aaa', 'bbb'])
    });


    this.fieldsInput.push({
      component: KlesFormInputComponent,
      clearable: true,
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
      // validations: [
      //   {
      //     name: 'list',
      //     validator: autocompleteObjectValidator(),
      //     message: 'Not in list'
      //   }
      // ]
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
      // validations: [
      //   {
      //     name: 'list',
      //     validator: autocompleteObjectValidator(true),
      //     message: 'Not in list'
      //   }
      // ]
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
      // validations: [
      //   {
      //     name: 'list',
      //     validator: autocompleteStringValidator([
      //       'aaa',
      //       'bbb'
      //     ]),
      //     message: 'Not in list'
      //   }
      // ]
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
      // validations: [
      //   {
      //     name: 'list',
      //     validator: autocompleteStringValidator([
      //       'aaa',
      //       'bbb'
      //     ], true),
      //     message: 'Not in list'
      //   }
      // ]
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
      accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    this.fieldsButton.push({
      component: KlesFormButtonToogleGroupComponent,
      name: 'buttonToogleTest',
      options: ['toto', 'titi'],
      multiple: true,
      tooltip: 'tooltip button toogle',
    });
  }

  french() {
    this._adapter.setLocale('fr');
  }
}
