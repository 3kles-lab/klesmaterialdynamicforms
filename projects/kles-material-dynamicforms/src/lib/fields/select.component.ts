import { Component, OnInit } from '@angular/core';
import { FieldAbstract } from './field.abstract';

@Component({
    selector: 'app-select',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
            <mat-option *ngFor="let item of field.options" [value]="item">{{field.property ? item[field.property] : item}}</mat-option>
        </mat-select>
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
export class SelectComponent extends FieldAbstract implements OnInit {
    ngOnInit() { super.ngOnInit(); }
}