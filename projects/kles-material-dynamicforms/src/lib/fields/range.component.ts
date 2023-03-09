import { Component, OnDestroy, OnInit } from "@angular/core";
import { FieldMapper } from "../decorators/component.decorator";
import { EnumType } from "../enums/type.enum";
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.range })
@Component({
    selector: "kles-form-rangepicker",
    template: `
    <mat-form-field [color]="field.color" [formGroup]="group">

        <mat-label>{{field.label}}</mat-label>

        <mat-date-range-input [formGroupName]="field.name" [rangePicker]="picker" matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" >
            <input matStartDate formControlName="start" [placeholder]="(field.placeholder?.start ? field.placeholder?.start : '') | translate">
            <input matEndDate formControlName="end" [placeholder]="(field.placeholder?.end ? field.placeholder?.end : '') | translate">
        </mat-date-range-input>
        
        <div matSuffix>
            <mat-datepicker-toggle [for]="picker" matSuffix></mat-datepicker-toggle>
            <ng-content></ng-content>
        </div>

        <mat-date-range-picker #picker></mat-date-range-picker>
        <mat-hint>{{field.hint}}</mat-hint>

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
export class KlesFormRangeComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    // range = new FormGroup({
    //     start: new FormControl<Date | null>(null),
    //     end: new FormControl<Date | null>(null),
    // });

    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
