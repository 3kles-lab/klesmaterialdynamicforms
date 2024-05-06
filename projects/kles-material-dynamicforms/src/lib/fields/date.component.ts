import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-datepicker',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" class="margin-top" [color]="field.color" [formGroup]="group" [appearance]="field.appearance">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="field.placeholder | translate"
        [min]="field.min" [max]="field.max">
        <div matSuffix class="suffix">
            <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
            <ng-content></ng-content>
        </div>
        <mat-datepicker #picker></mat-datepicker>
        @if (field.hint) {
            <mat-hint>{{field.hint}}</mat-hint>
        }

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
        </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}',
        '.suffix { display: flex; flex-direction: row}'
    ]
})
export class KlesFormDateComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
