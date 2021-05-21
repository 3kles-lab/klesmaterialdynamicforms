import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  IButton, IButtonChecker, IKlesFieldConfig, IKlesValidator, KlesDynamicFormComponent,
  KlesFormButtonCheckerComponent, KlesFormButtonComponent, KlesFormChipComponent,
  KlesFormInputComponent, KlesFormLabelComponent, KlesFormTextareaComponent,
} from 'kles-material-dynamicforms';
import { autocompleteObjectValidator, autocompleteStringValidator } from 'projects/kles-material-dynamicforms/src/public-api';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' },

    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
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
  title = 'KlesMaterialDynamicForms';

  item = { error: [] };
  fields: IKlesFieldConfig[] = [];
  formValidators: IKlesValidator<ValidatorFn>[] = [];

  constructor(private _adapter: DateAdapter<any>) {
    this.item['input'] = 'input';
    this.item['color'] = '#abcd';
    this.item['checkbox'] = true;
    this.item['date'] = new Date();
    this.item['radio'] = true;
    this.item['select'] = ['val1', 'val2'];
    this.item['button'] = {};
    this.item['#checker'] = { error: [{}, {}] };

    this.fields.push(this.buildByType('input'));
    this.fields.push(this.buildByType('color'));
    this.fields.push(this.buildByType('checkbox'));
    this.fields.push(this.buildByType('date'));
    this.fields.push(this.buildByType('radio'));
    this.fields.push(this.buildByType('select'));
    //   this.fields.push(this.buildByType('button'));

    this.fields.push({
      component: KlesFormButtonComponent,
      label: 'button',
      name: 'button',
      //value: this.item['button']
    });

    this.fields.push({
      component: KlesFormButtonCheckerComponent,
      label: '#checker',
      name: '#checker',
      //value: this.item['#checker']
    });

    this.fields.push({
      component: KlesFormLabelComponent,
      label: 'Label',
      name: 'Label',
      value: 'Value'
    });

    this.fields.push({
      component: KlesFormTextareaComponent,
      placeholder: 'textarea',
      textareaAutoSize: {
        minRows: 10
      },
      name: 'textarea'
    });


    this.fields.push({
      component: KlesFormInputComponent,
      placeholder: 'autocomplete with object array',
      name: 'autocompleteWithobject',
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

    this.fields.push({
      component: KlesFormInputComponent,
      label: 'autoComplete',
      placeholder: 'autocomplete with string array',
      name: 'autocomplete',
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

    this.fields.push({
      component: KlesFormChipComponent,
      name: 'chip',
      value: 'chip'
    })


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


    this.form.form.controls['input'].valueChanges.subscribe(s => {
      console.log('Input change=', s);

      const currentButtonValue: IButton = {
        uiButton: {
          label: 'LOL'
        }
      }
      console.log('Current Button Value=', currentButtonValue);
      this.form.form.controls['button'].patchValue(currentButtonValue);


      const currentCheckerButtonValue: IButtonChecker = {
        busy: false,
        error: [{}, {}, {}],
        uiButton: {
          label: 'LOL'
        }
      }
      this.form.form.controls['#checker'].patchValue(currentCheckerButtonValue);
    });

    this.form.form.controls['button'].valueChanges.subscribe(s => {
      console.log('Button change=', s);
    });
  }

  buildByType(key: string): IKlesFieldConfig {
    return {
      type: key,
      label: key,
      name: key,
      value: this.item ? this.item[key] || '' : '',
    }
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
