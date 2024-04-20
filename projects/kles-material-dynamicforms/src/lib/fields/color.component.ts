import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component, OnDestroy } from '@angular/core';
@Component({
  selector: 'kles-form-color',
  template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" [formGroup]="group" class="form-element"
    [colorPicker]="group.get(field.name).value"
    (colorPickerChange)="group.get(field.name).setValue($event)"
    [cpPosition]="field.colorOption.position"
    [cpColorMode]="field.colorOption.mode"
    [cpOutputFormat]="field.colorOption.format"
    [cpPositionOffset]="field.colorOption.positionOffset"
    [appearance]="field.appearance"
    >
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate"
            [value]="group.get(field.name).value"
            class="colorPicker"
            [style.background]="group.get(field.name).value"
            [style.color]="invertColor(group.get(field.name).value,true)"
            [formControlName]="field.name">

        @if (field.subComponents || field.clearable) {
            <div matSuffix>
                <ng-content></ng-content>
            </div>
        }

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
    </mat-form-field>
    `,
  styles: ['mat-form-field {width: calc(100%)}']
})
export class KlesFormColorComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

  ngOnInit() {
    if (!this.field.colorOption) {
      this.field.colorOption = {
        position: 'auto',
        mode: 'color',
        format: 'auto',
        positionOffset: '0%'
      }
    }
    if (!this.field.colorOption.position) {
      this.field.colorOption = {
        ...this.field.colorOption,
        position: 'auto'
      }
    }
    if (!this.field.colorOption.mode) {
      this.field.colorOption = {
        ...this.field.colorOption,
        mode: 'color'
      }
    }
    if (!this.field.colorOption.format) {
      this.field.colorOption = {
        ...this.field.colorOption,
        format: 'auto'
      }
    }
    if (!this.field.colorOption.positionOffset) {
      this.field.colorOption = {
        ...this.field.colorOption,
        positionOffset: '0%'
      }
    }
    super.ngOnInit();
  }

  invertColor(hex, bw): string {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
      return '#000000';
    }
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? '#000000'
        : '#FFFFFF';
    }
    // invert color components
    const r1 = (255 - r).toString(16);
    const g1 = (255 - g).toString(16);
    const b1 = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + r1 + g1 + b1;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
