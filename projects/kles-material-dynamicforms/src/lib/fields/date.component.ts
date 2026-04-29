import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from "@angular/common";
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatErrorMessageDirective } from "../directive/mat-error-message.directive";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ReactiveFormsModule } from "@angular/forms";
import { MatTooltip } from "@angular/material/tooltip";
import { MatInput } from "@angular/material/input";

@Component({
    selector: 'kles-form-datepicker',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" class="margin-top" [color]="field.color" [formGroup]="group" [appearance]="field.appearance">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="field.placeholder"
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
    ],
    standalone: true,
    imports: [CommonModule, MatErrorMessageDirective, MatError, MatHint, MatDatepickerModule, ReactiveFormsModule, MatTooltip, MatLabel, MatFormField, MatInput, MatSuffix],
})
export class KlesFormDateComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
