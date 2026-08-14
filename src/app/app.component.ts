import { PropertyPipe } from '@3kles/kles-ng-pipe';
import { DecimalPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild, ViewEncapsulation, DOCUMENT, WritableSignal, signal } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
    EnumType,
    IButton,
    IButtonChecker,
    KlesDynamicFormIntl,
    KlesFormActionMenuComponent,
    KlesFormCheckboxComponent,
    KlesFormCheckboxIndeterminateComponent,
    KlesFormCurrencyComponent,
    KlesFormDateComponent,
    KlesFormFabComponent,
    KlesFormFileComponent,
    KlesFormIconButtonComponent,
    KlesFormMiniFabComponent,
    KlesFormTileComponent,
    KlesMaterialDynamicformsModule,
} from 'kles-material-dynamicforms';
import {
    IKlesFieldConfig,
    IKlesValidator,
    KlesDynamicFormComponent,
    KlesFormButtonCheckerComponent,
    KlesFormButtonComponent,
    KlesFormButtonFileComponent,
    KlesFormChipComponent,
    KlesFormColorComponent,
    KlesFormIconComponent,
    KlesFormInputComponent,
    KlesFormSelectionListComponent,
    KlesFormTextareaComponent,
    KlesFormTextComponent,
    KlesFormCopyComponent,
    KlesFormInputClearableComponent,
    KlesFormSelectComponent,
    KlesFormSelectSearchComponent,
    KlesFormDateTimeComponent,
} from 'kles-material-dynamicforms';
import { KlesFormButtonToogleGroupComponent } from 'kles-material-dynamicforms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, delay, map, shareReplay } from 'rxjs/operators';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { PeekABooDirective } from './directives/test.directive';
import { SelectOptionComponent } from './select/select-option.component';
import { SelectTriggerComponent } from './select/select-trigger.component';
import { MaterialModule } from './modules/material.module';

import { TranslatedKlesLabelIntl } from './app-intl';
import { KlesMatDateAdapter, KlesMatDatepickerIntl } from '@3kles/kles-material-datepicker';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { KLES_MAT_LUXON_FORMATS, KlesMatLuxonAdapter } from '@3kles/kles-material-luxon-adapter';
import { KLES_MAT_MOMENT_FORMATS, KlesMatMomentAdapter } from '@3kles/kles-material-moment-adapter';
import { DatePickerIntl } from './date-picker.i18n';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        // { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
        // {
        //   provide: DateAdapter,
        //   useClass: MomentDateAdapter,
        //   deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        // },
        // { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: KlesMatDateAdapter, useClass: KlesMatLuxonAdapter },
        { provide: DateAdapter, useClass: LuxonDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: KLES_MAT_LUXON_FORMATS },
        // { provide: KlesMatDateAdapter, useClass: KlesMatMomentAdapter },
        // { provide: DateAdapter, useClass: MomentDateAdapter },
        // { provide: MAT_DATE_FORMATS, useValue: KLES_MAT_MOMENT_FORMATS },
        {
            provide: KlesMatDatepickerIntl,
            useClass: DatePickerIntl,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [KlesDynamicFormComponent, MaterialModule],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit {
    title = 'KlesMaterialDynamicForms';
    color = '';

    private document = inject(DOCUMENT);

    @ViewChild('form', { static: false }) form: KlesDynamicFormComponent;
    fields: IKlesFieldConfig[];
    formValidators: IKlesValidator<ValidatorFn>[] = [];

    @ViewChild('formText', { static: false }) formText: KlesDynamicFormComponent;
    fieldsText: IKlesFieldConfig[];
    formValidatorsText: IKlesValidator<ValidatorFn>[] = [];

    @ViewChild('formInput', { static: false }) formInput: KlesDynamicFormComponent;
    fieldsInput: IKlesFieldConfig[];
    formValidatorsInput: IKlesValidator<ValidatorFn>[] = [];

    @ViewChild('formButton', { static: false }) formButton: KlesDynamicFormComponent;
    fieldsButton: IKlesFieldConfig[];
    formValidatorsButton: IKlesValidator<ValidatorFn>[] = [];
    colorVariable = '#00FF00';

    @ViewChild('formError', { static: false }) formError: KlesDynamicFormComponent;
    fieldsError: IKlesFieldConfig[];
    formValidatorsError: IKlesValidator<ValidatorFn>[] = [];
    formAsyncValidatorsError: IKlesValidator<AsyncValidatorFn>[] = [];

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

    constructor(
        private _adapter: DateAdapter<any>,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private ref: ChangeDetectorRef,
    ) {
        this.matIconRegistry.addSvgIcon('excel', this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/images/excel.svg'));

        const decPipe = new DecimalPipe('fr-FR');
        const val = decPipe.transform(10.467, '1.2-2');
        // console.log('Val=', val);

        //Text Form
        this.buildTextForm();

        //Form
        this.buildForm();

        //Button Form
        this.buildButtonForm();

        //Input Form
        this.buildInputForm();

        //Error Form
        this.buildErrorForm();
    }

    ngOnInit() {
        this.warehouseList = this.options2.map((o) => {
            return { WHLO: o, test: o };
        });
    }

    ngAfterViewInit(): void {
        Object.keys(this.formButton.form.controls).forEach((e) => {
            // console.log('FormButton ', e, '=', this.formButton.form.controls[e]);
        });

        this.formButton.form.controls['buttonfile'].valueChanges.subscribe((s) => {
            console.log('Button file changed=', s);
        });

        // this.formButton.form.valueChanges.subscribe((s) => {
        //     console.log('Button changed=', s);
        //     const val = Object.keys(s).find((f) => s[f]);
        //     console.log(val);
        //     if (val) {
        //         this.formButton.form.reset();
        //     }
        // });

        this.form.form.valueChanges.subscribe((s) => {
            console.log('Group changed=', this.form, ' with value=', s);
        });

        // setTimeout((() => {
        //   console.log('AAA!!!');
        //   this.formInput?.form?.controls?.testSelectGino?.setValue(this.warehouseList[4], { onlySelf: true, emitEvent: false });
        // }).bind(this), 3000);

        // setTimeout((() => {
        //   console.log('BBB!!!');
        //   const value = this.formInput?.form?.controls?.testSelectGino?.value;
        //   this.formInput?.form?.controls?.testSelectGino2?.setValue(value, { onlySelf: true, emitEvent: false });
        // }).bind(this), 5000);

        // this.formInput.form.valueChanges.subscribe(value => console.log(this.formInput.form));
        // this.formInput.form.statusChanges.subscribe(value => console.log('status', this.formInput.form));

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
        this.fields = [
            {
                component: KlesFormCheckboxIndeterminateComponent,
                name: 'checkbox',
                // value: -1, // -1 mean indeterminate state
            },
            {
                component: KlesFormChipComponent,
                name: 'chip',
                value: 'chip',
            },
            {
                component: KlesFormIconComponent,
                name: 'icon',
                value: 'dns',
                // color: 'accent'
                ngStyle: {
                    color: this.colorVariable,
                },
            },
            {
                component: KlesFormColorComponent,
                name: 'color',
                value: '',
            },
            {
                component: KlesFormCurrencyComponent,
                name: 'amount',
                label: 'Montant',
                placeholder: '0,00 €',
                value: 1250.5,
                min: 0,
                max: 1000000,
                currencyOptions: {
                    code: 'EUR',
                    locale: 'fr-FR',
                    display: 'symbol',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    useGrouping: true,
                    allowNegative: false,
                },
            },
            {
                component: KlesFormSelectionListComponent,
                name: 'selectionList',
                multiple: true,
                options: of([...Array(500).keys()]) as Subject<any>,
            },
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
                    },
                ],
            },
            {
                type: EnumType.array,
                name: 'arrayField',
                value: [{ firstElement: 'aaa', secondElement: 'bbb' }, { firstElement: 'cccc' }],
                collections: [
                    {
                        component: KlesFormInputComponent,
                        name: 'firstElement',
                        placeholder: 'firstElement',
                        value: 'aaaa',
                    },
                    {
                        component: KlesFormInputComponent,
                        name: 'secondElement',
                        placeholder: 'secondElement',
                    },
                    {
                        component: KlesFormButtonComponent,
                        name: 'matbutton',
                        label: 'mat button',
                        color: 'accent',
                    },
                ],
            },
        ];
    }

    buildTextForm() {
        this.fieldsText = [
            {
                name: 'file',
                placeholder: 'File',
                multiple: true,
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: 'required',
                    },
                ],
                component: KlesFormFileComponent,
            },
            {
                name: 'text',
                placeholder: 'Text',
                inputType: 'text',
                tooltip: 'tooltip text',
                value: 'ici la directive',
                component: KlesFormTextComponent,
                directive: PeekABooDirective,
            },
        ];
    }

    buildInputForm() {
        const toto = [
            { BUAR: 'A', TX40: 'aaaa' },
            { BUAR: 'C', TX40: 'bbb' },
        ];

        const options = [...Array(10000).keys()];
        const optionsTest = [{ SUNO: 'aaa' }, { SUNO: 'vbbb' }, { SUNO: 'ccc' }];

        this.fieldsInput = [
            {
                name: 'provider',
                component: KlesFormTileComponent,
                label: 'Google Workspace',
                hint: 'SSO for Google Workspace',
                imageUrl: 'https://www.gstatic.com/marketing-cms/assets/images/97/37/bbe70068407199f1ada4b3f6b9f8/g-about-gatg.png=n-w64-h65-fcrop64=1,00000367fffffd72-rw',
                imageAlt: 'Google Workspace',
                tooltip: 'Configurer Google Workspace',
            },
            {
                name: 'inputtext',
                placeholder: 'Input Text',
                inputType: 'text',
                tooltip: 'tooltip text',
                // value: 'input text value',
                asyncValue: of(null).pipe(delay(5000)),
                validations: [
                    {
                        validator: Validators.required,
                        name: 'required',
                        message: 'fsdfdsfdsf',
                    },
                ],
                component: KlesFormInputComponent,
                valueChanges: (field, group, siblingFields) => {
                    if (group.controls[field.name].value === 'test') {
                        (siblingFields.find((sibling) => sibling.name === 'selectTest').options as BehaviorSubject<string[]>).next(['ccc', 'dddd']);
                    }
                },
            },
            {
                name: 'inputtextmax',
                placeholder: 'Input Text MaxLength',
                inputType: 'text',
                tooltip: 'tooltip text',
                maxLength: 10,
                copyTooltip: 'Valeur copiée',
                subComponents: [KlesFormCopyComponent],
                component: KlesFormInputComponent,
            },
            {
                name: 'inputnumber',
                placeholder: 'Input Number',
                inputType: 'number',
                tooltip: 'tooltip number',
                value: 10.463,
                component: KlesFormTextComponent,
                pipeTransform: [
                    {
                        pipe: new DecimalPipe('fr-FR'),
                        options: ['1.2-2'],
                    },
                ],
            },
            {
                name: 'inputobj',
                placeholder: 'Input Object',
                inputType: 'text',
                tooltip: 'tooltip object',
                value: {
                    usid: 'USID',
                    name: 'Name',
                },
                component: KlesFormInputComponent,
                pipeTransform: [
                    {
                        pipe: new PropertyPipe(),
                        options: ['usid'],
                    },
                ],
            },
            {
                name: 'inputclear',
                placeholder: 'Input clearable',
                inputType: 'text',
                tooltip: 'tooltip input clear',
                value: 'input clearable',
                component: KlesFormInputClearableComponent,
            },
            {
                name: 'inputcleardisabled',
                placeholder: 'Input clearable disabled',
                inputType: 'text',
                tooltip: 'tooltip input clear disabled',
                value: 'input clearable disabled',
                disabled: true,
                component: KlesFormInputClearableComponent,
            },
            {
                name: 'selectTest',
                placeholder: 'select multiple',
                component: KlesFormSelectSearchComponent,
                property: 'BUAR',
                triggerComponent: SelectTriggerComponent,
                autocompleteComponent: SelectOptionComponent,
                multiple: true,
                lazy: true,
                virtualScroll: true,
                value: [toto[0]],
                options: new BehaviorSubject<any[]>(toto).pipe(delay(1000), shareReplay(1)),
                // providers: [
                //     {
                //                 provide: KlesDynamicFormIntl,
                //                 useClass: TranslatedKlesLabelIntl,
                //             },
                // ]
                // options: of(['aaa', 'bbb'])
            },
            {
                name: 'date',
                placeholder: 'date',
                hint: 'test',
                component: KlesFormDateComponent,
                clearable: true,
                dateOptions: {
                    adapter: {
                        class: MomentDateAdapter,
                        deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
                    },
                    language: 'hi-IN',
                    dateFormat: {
                        parse: {
                            dateInput: 'DD/MM/YYYY',
                        },
                        display: {
                            dateInput: 'MM/YYYY/DD',
                            monthYearLabel: 'MMM YYYY',
                            dateA11yLabel: 'MM/YYYY/DD',
                            monthYearA11yLabel: 'MMM YYYY',
                        },
                    },
                },
            },
            {
                name: 'datetime',
                placeholder: 'datetime',
                hint: 'test',
                component: KlesFormDateTimeComponent,
                clearable: true,
            },
            {
                name: 'range',
                placeholder: { start: 'debut', end: 'fin' },
                type: EnumType.range,
                clearable: true,
                label: 'Enter a date range',
            },
            {
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
            },
            {
                name: 'selectTestSimple',
                placeholder: 'select simple',
                component: KlesFormSelectComponent,
                // component: KlesFormSelectComponent,
                property: 'BUAR',
                autocompleteComponent: SelectOptionComponent,
                lazy: true,
                value: toto[0],
                // options: toto
                options: new BehaviorSubject<any[]>(toto).pipe(delay(2000), shareReplay(1)),
                // options: [{ BUAR: 'A', TX40: 'aaaa' }, { BUAR: 'C', TX40: 'bbb' }]
                // options: of(['aaa', 'bbb'])
            },
            {
                name: 'selectSearchMultipleKey',
                placeholder: 'select search with multiple key',
                component: KlesFormSelectSearchComponent,
                searchKeys: ['BUAR', 'TX40'],
                property: 'BUAR',
                clearable: true,
                autocompleteComponent: SelectOptionComponent,
                options: new BehaviorSubject<any[]>([
                    { BUAR: 'A', TX40: 'aaaa' },
                    { BUAR: 'C', TX40: 'bbb' },
                ]),
                // options: of(['aaa', 'bbb'])
            },
            {
                name: 'selectTestSimpleInfinite',
                placeholder: 'select simple infinite',
                component: KlesFormSelectComponent,
                multiple: true,
                virtualScroll: true,
                options: options,
                value: [options[9999]],
                // options: of(['aaa', 'bbb'])
            },
            {
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
                    { test: 'bbb', val: 'bbb' },
                ] as any,
                // validations: [
                //   {
                //     name: 'list',
                //     validator: autocompleteObjectValidator(),
                //     message: 'Not in list'
                //   }
                // ]
            },
            {
                component: KlesFormInputComponent,
                placeholder: 'autocomplete optional with object array',
                name: 'autocompleteWithobjectOptional',
                autocomplete: true,
                maxLength: 3,
                autocompleteComponent: AutocompleteComponent,
                property: 'test',
                options: [
                    { test: 'aaa', val: 'rrr' },
                    { test: 'bbb', val: 'bbb' },
                ] as any,
                // validations: [
                //   {
                //     name: 'list',
                //     validator: autocompleteObjectValidator(true),
                //     message: 'Not in list'
                //   }
                // ]
            },
            {
                component: KlesFormInputComponent,
                label: 'autoComplete',
                placeholder: 'autocomplete mandatory with string array',
                name: 'autocompleteMandatory',
                autocomplete: true,
                options: ['aaa', 'bbb'] as any,
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
            },
            {
                component: KlesFormInputComponent,
                label: 'autoComplete',
                placeholder: 'autocomplete optional with string array',
                name: 'autocompleteOptional',
                autocomplete: true,
                options: ['aaa', 'bbb'] as any,
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
            },
            {
                component: KlesFormTextareaComponent,
                placeholder: 'textarea',
                textareaAutoSize: {
                    minRows: 10,
                },
                name: 'textarea',
            },
        ];
    }

    buildButtonForm() {
        this.fieldsButton = [
            {
                name: 'actions',
                component: KlesFormActionMenuComponent,
                icon: 'more_vert',
                tooltip: 'Actions',
                // ariaLabel: 'Actions disponibles',
                options: [
                    {
                        id: 'edit',
                        label: 'Modifier',
                        icon: 'edit',

                        // disabled: (context) => context?.readonlyMode === true,
                    },
                    {
                        id: 'duplicate',
                        label: 'Dupliquer',
                        icon: 'content_copy',
                    },
                    {
                        id: 'delete',
                        label: 'Supprimer',
                        icon: 'delete',
                        color: 'warn',
                        dividerBefore: true,

                        // visible: (context) => context?.provider.canDelete === true,
                    },
                ],

                onAction: ({ actionId, context, value, group }) => {
                    console.log('Actionid', actionId);
                    console.log('Action sélectionnée', value);
                    console.log('Valeurs de la ligne', group.getRawValue());
                },
            },
            {
                name: 'matbutton',
                label: 'mat button',
                color: 'accent',
                icon: 'clear',
                tooltip: 'tooltip button',
                component: KlesFormButtonComponent,
            },
            {
                name: 'buttonraised',
                label: 'mat raised button',
                color: 'accent',
                icon: 'clear',
                buttonAppearance: 'elevated',
                tooltip: 'tooltip button',
                component: KlesFormButtonComponent,
            },

            {
                name: 'buttonstroked',
                label: 'mat stroked button',
                color: 'accent',
                iconSvg: 'excel',
                tooltip: 'tooltip button',
                buttonAppearance: 'outlined',
                component: KlesFormButtonComponent,
            },

            {
                name: 'buttonflat1',
                label: 'mat flat button',
                icon: 'clear',
                buttonAppearance: 'tonal',
                tooltip: 'tooltip button',
                hostClass: 'orange',
                component: KlesFormButtonComponent,
            },
            {
                name: 'buttonflat2',
                label: 'mat flat button',
                icon: 'clear',
                buttonAppearance: 'filled',
                tooltip: 'tooltip button',
                hostClass: 'green',
                component: KlesFormButtonComponent,
            },
            {
                name: 'buttonflat3',
                label: 'mat flat button',
                icon: 'clear',
                buttonAppearance: 'filled',
                tooltip: 'tooltip button',
                hostClass: 'blue',
                component: KlesFormButtonComponent,
            },

            {
                name: 'buttonIcon',
                color: 'primary',
                icon: 'add',
                tooltip: 'tooltip icon button',
                component: KlesFormIconButtonComponent,
                onAction: (event) => {
                    console.log(event);
                },
            },

            {
                name: 'buttonFab',
                color: 'primary',
                // icon: 'add',
                label: 'test',
                tooltip: 'tooltip button',
                component: KlesFormFabComponent,
            },

            {
                name: 'buttonmini',
                color: 'accent',
                icon: 'add',
                tooltip: 'tooltip button',
                component: KlesFormMiniFabComponent,
            },

            {
                name: 'buttonprimary',
                color: 'primary',
                icon: 'delete',
                ngClass: 'mat-mini-fab',
                tooltip: 'tooltip button',
                component: KlesFormMiniFabComponent,
            },

            {
                component: KlesFormButtonCheckerComponent,
                name: 'checkerbusy',
                value: { busy: true, message: 'Checking...' },
            },

            {
                component: KlesFormButtonCheckerComponent,
                name: 'checkererror',
                label: 'View error',
                color: 'warning',
                icon: 'clear',
                ngClass: 'mat-raised-button',
                tooltip: 'tooltip button',
                value: { error: [{}, {}] },
            },

            {
                component: KlesFormButtonFileComponent,
                name: 'buttonfile',
                label: 'Choose file',
                color: 'accent',
                iconSvg: 'excel',
                ngClass: 'mat-raised-button',
                tooltip: 'tooltip button',
                accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },

            {
                component: KlesFormButtonToogleGroupComponent,
                name: 'buttonToogleTest',
                options: ['toto', 'titi'],
                multiple: true,
                tooltip: 'tooltip button toogle',
            },
        ];
    }

    buildErrorForm() {
        this.fieldsError = [
            {
                name: 'beginvalue',
                component: KlesFormInputComponent,
                inputType: 'number',
                label: 'Begin value',
                clearable: true,
                subscriptSizing: 'dynamic',
                validations: [
                    {
                        message: 'status.value.begin.error.required.text',
                        name: 'required',
                        validator: Validators.required,
                    },
                    {
                        name: 'pattern',
                        validator: Validators.pattern('^([0-9][0-9]{0,2}|1000)$'),
                        message: 'status.value.begin.error.notValid.text',
                    },
                ],
            },
            {
                name: 'endvalue',
                component: KlesFormInputComponent,
                inputType: 'number',
                label: 'End value',
                clearable: true,
                subscriptSizing: 'dynamic',
                validations: [
                    {
                        message: 'status.value.end.error.required.text',
                        name: 'required',
                        validator: Validators.required,
                    },
                    {
                        name: 'pattern',
                        validator: Validators.pattern('^([0-9][0-9]{0,2}|1000)$'),
                        message: 'status.value.end.error.notValid.text',
                    },
                ],
            },
            // {
            //   name: 'color',
            //   component: KlesFormColorComponent,
            //   label: 'Color',
            //   clearable: true,
            //   subscriptSizing: "dynamic",
            // }
        ];
        this.formAsyncValidatorsError = [
            {
                name: 'overlap',
                validator: this.checkOverlaping('beginvalue', 'endvalue'),
                message: 'status.error.overlap.text',
            },
        ];
        this.formValidatorsError = [
            {
                name: 'beginend',
                validator: this.checkBeginEndValue('beginvalue', 'endvalue'),
                message: 'status.error.range.text',
            },
        ];
    }

    checkBeginEndValue(begin: string, end: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            if (!control) {
                return null;
            }
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

    checkOverlaping(begin: string, end: string): AsyncValidatorFn {
        return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
            return of([
                {
                    beginvalue: 0,
                    endvalue: 50,
                    color: 'red',
                },
                {
                    beginvalue: 50,
                    endvalue: 200,
                    color: 'red',
                },
            ]).pipe(
                catchError(() => {
                    return of(null);
                }),
                map((listStatus) => {
                    const beginControl = control.get(begin);
                    const endControl = control.get(end);
                    if (!beginControl.value || !endControl.value) {
                        return null;
                    }
                    let value = null;

                    listStatus.forEach((line) => {
                        if ((Number(line.beginvalue) <= Number(beginControl.value) && Number(beginControl.value) < Number(line.endvalue)) || (Number(line.beginvalue) < Number(endControl.value) && Number(endControl.value) < Number(line.endvalue))) {
                            console.log('Error');
                            value = { overlap: true };
                        }
                    });
                    return value;
                }),
            );
        };
    }

    french() {
        this._adapter.setLocale('fr');
        // Set checkbox to indeterminate
        this.form.form.controls.checkbox.patchValue(-1, { emitEvent: false, onlySelf: true });
    }

    public toggleThemeMode(event) {
        this.document.body.classList.toggle('dark');
    }
}
