import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IKlesValidator, IKlesField,KlesFormButtonComponent, IKlesFieldConfig, KlesFormButtonCheckerComponent, KlesDynamicFormComponent } from 'kles-material-dynamicforms';

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
    this.item['buttonChecker'] = {error:[{},{}]};

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
      value: this.item['button']
    });

    this.fields.push({
      component: KlesFormButtonCheckerComponent,
      label: 'buttonChecker',
      name: 'buttonChecker',
      value: this.item['buttonChecker']
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
    console.log('Form=',this.form.form);
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
