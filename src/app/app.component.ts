import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IKlesValidator, IKlesField, KlesFormButtonComponent, IKlesFieldConfig, KlesFormButtonCheckerComponent, KlesDynamicFormComponent, KlesFormLabelComponent } from 'kles-material-dynamicforms';
import { IButton, IButtonChecker } from 'projects/kles-material-dynamicforms/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(KlesDynamicFormComponent, { static: false }) form: KlesDynamicFormComponent;
  title = 'KlesMaterialDynamicForms';

  item = { error: [] };
  fields: IKlesFieldConfig[] = [];
  formValidators: IKlesValidator<ValidatorFn>[] = [];

  constructor() {
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
}
