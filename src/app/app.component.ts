import { Component } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IField, IFieldConfig, IValidator } from 'kles-material-dynamicforms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KlesMaterialDynamicForms';

  item = { error: [] };
  fields: IFieldConfig[]=[];
  formValidators: IValidator<ValidatorFn>[] = [];

  constructor() {
    this.item['input'] = 'input';
    this.item['color'] = '#abcd';
    this.item['checkbox'] = true;
    this.item['date'] = new Date();
    this.item['radio'] = true;
    this.item['select'] = ['val1', 'val2'];
    this.item['button'] = 'button';

    this.fields.push(this.buildByType('input'));
    this.fields.push(this.buildByType('color'));
    this.fields.push(this.buildByType('checkbox'));
    this.fields.push(this.buildByType('date'));
    this.fields.push(this.buildByType('radio'));
    this.fields.push(this.buildByType('select'));
    this.fields.push(this.buildByType('button'));

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

  buildByType(key: string): IFieldConfig {
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
