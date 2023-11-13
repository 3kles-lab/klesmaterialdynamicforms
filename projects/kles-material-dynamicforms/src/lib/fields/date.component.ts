import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: "kles-form-datepicker",
    template: `
    <mat-form-field class="margin-top" [color]="field.color" [formGroup]="group">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="field.placeholder | translate"
        [min]="field.min" [max]="field.max">
        <div matSuffix>
            <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
            <ng-content></ng-content>
        </div>
        <mat-datepicker #picker></mat-datepicker>
        <mat-hint>{{field.hint}}</mat-hint>

        @for (validation of field.validations; track validation.name) {
            <ng-container ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message | translate}}</mat-error>
                }
            </ng-container>
        }
        @for (validation of field.asyncValidations; track validation.name) {
            <ng-container ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message | translate}}</mat-error>
                }
            </ng-container>
        }
        </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}']
})
export class KlesFormDateComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
