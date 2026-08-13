import { Component } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormField, MatLabel, MatHint, MatError, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatTooltip } from "@angular/material/tooltip";
import { MatErrorMessageDirective } from "../directive/mat-error-message.directive";
import { KlesMaterialDatepickerModule } from "@3kles/kles-material-datepicker";

@Component({
    selector: 'kles-form-datetimepicker',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" class="margin-top" [color]="color()" [formGroup]="group" [appearance]="appearance()">
        @if (field.label) {
            <mat-label>{{ field.label }}</mat-label>
        }

        <input matInput matTooltip="{{ field.tooltip }}" [attr.id]="field.id" [ngClass]="field.ngClass" [matDatepicker]="picker" [formControlName]="field.name"
            [placeholder]="field.placeholder" [min]="field.min" [max]="field.max">
        <div matSuffix class="suffix">
            <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
            <ng-content></ng-content>
        </div>

        <kles-mat-datepicker #picker [hasBackdrop]="false"></kles-mat-datepicker>

        @if (field.hint) {
            <mat-hint>{{ field.hint }}</mat-hint>
        }

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
    </mat-form-field>
    `,
    styles: [
        'mat-form-field { width: calc(100%); }',
        '.suffix { display: flex; flex-direction: row; }'
    ],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatHint,
        MatError,
        MatSuffix,
        MatInput,
        MatTooltip,
        MatDatepickerModule,
        MatErrorMessageDirective,
        KlesMaterialDatepickerModule
    ]
})
export class KlesFormDateTimeComponent extends KlesFieldAbstract {
}
