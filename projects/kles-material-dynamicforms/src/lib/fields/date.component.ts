import { Component, OnInit } from "@angular/core";
import { IFieldConfig } from '../interfaces/field.config.interface';
import { FieldAbstract } from './field.abstract';

@Component({
    selector: "app-date",
    template: `
    <mat-form-field class="demo-full-width margin-top" [formGroup]="group">
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="field.placeholder | translate">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
        <mat-hint></mat-hint>
        
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
        </mat-form-field>
    `,
    styles: []
})
export class DateComponent extends FieldAbstract implements OnInit {
    ngOnInit() {super.ngOnInit(); }
}