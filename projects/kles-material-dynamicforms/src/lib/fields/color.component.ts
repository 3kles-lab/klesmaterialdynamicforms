import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component, OnDestroy } from '@angular/core';
@Component({
    selector: 'kles-form-color',
    template: `
    <mat-form-field [formGroup]="group" class="form-element">
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate"
            [colorPicker]="group.get(field.name).value"
            [value]="group.get(field.name).value"
            (colorPickerChange)="group.get(field.name).setValue($event)"
            class="colorPicker"
            [style.background]="group.get(field.name).value"
            [style.color]="invertColor(group.get(field.name).value,true)"
            [formControlName]="field.name">

        @if (field.subComponents || field.clearable) {
            <div matSuffix>
                <ng-content></ng-content>
            </div>
        }
 
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            @if (group.get(field.name).hasError(validation.name)) {
                <mat-error>{{validation.message | translate}}</mat-error>
            }
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            @if (group.get(field.name).hasError(validation.name)) {
                <mat-error>{{validation.message | translate}}</mat-error>
            }
        </ng-container>
    </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}']
})
export class KlesFormColorComponent extends KlesFieldAbstract implements OnInit, OnDestroy {


    ngOnInit() { super.ngOnInit(); }

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
