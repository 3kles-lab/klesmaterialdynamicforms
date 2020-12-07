
import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IFieldConfig } from '..';
import { FieldAbstract } from './field.abstract';


@Component({
    selector: "app-checkbox",
    template: `
    <div [formGroup]="group" >  
        <mat-checkbox matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [indeterminate]="field.indeterminate" [formControlName]="field.name">{{field.label | translate}}</mat-checkbox>
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        </ng-container>
    </div>
`,
    styles: []
})
export class CheckboxComponent extends FieldAbstract implements OnInit {
    field: IFieldConfig;
    group: FormGroup;
    ngOnInit() { super.ngOnInit(); }
}