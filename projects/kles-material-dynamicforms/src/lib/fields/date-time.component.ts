import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: "kles-form-datetimepicker",
    template: `
    <mat-form-field class="margin-top" [color]="field.color" [formGroup]="group">
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="field.placeholder | translate"
        [min]="field.min" [max]="field.max">
        <div matSuffix>
            <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
            <ng-content></ng-content>
        </div>
        <kles-mat-datepicker #picker [hasBackdrop]="false"></kles-mat-datepicker>
        <mat-hint>{{field.hint}}</mat-hint>

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
export class KlesFormDateTimeComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
