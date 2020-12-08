import { FieldAbstract } from './field.abstract';
import { OnInit, Component } from '@angular/core';
@Component({
    selector: 'app-color',
    template: `
    <mat-form-field [formGroup]="group" class="form-element">
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate"
            [colorPicker]="group.get(field.name).value"
            [value]="group.get(field.name).value"
            (colorPickerChange)="group.get(field.name).setValue($event)"
            class="colorPicker"
            [style.background]="group.get(field.name).value"
            [formControlName]="field.name">
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
    </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}']
})
export class ColorComponent extends FieldAbstract implements OnInit {


    ngOnInit() {super.ngOnInit(); }
}
