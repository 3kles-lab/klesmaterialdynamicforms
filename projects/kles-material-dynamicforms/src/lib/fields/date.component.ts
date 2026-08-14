import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatFormFieldModule, MatHint, MatLabel } from '@angular/material/form-field';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatInput, MatInputModule } from '@angular/material/input';

@Component({
    selector: 'kles-form-datepicker',
    template: `
        <mat-form-field [subscriptSizing]="field.subscriptSizing" class="margin-top" [color]="color()" [formGroup]="group" [appearance]="appearance()">
            @if (label()) {
                <mat-label>{{ label() }}</mat-label>
            }
            <input matInput [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [matDatepicker]="picker" [formControlName]="field.name" [placeholder]="placeholder()" [min]="min()" [max]="max()" />
            <div matSuffix class="suffix">
                <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
                <ng-content></ng-content>
            </div>
            <mat-datepicker #picker></mat-datepicker>
            @if (hint()) {
                <mat-hint>{{ hint() }}</mat-hint>
            }

            <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
        </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}', '.suffix { display: flex; flex-direction: row}'],
    standalone: true,
    imports: [CommonModule, MatErrorMessageDirective, MatFormFieldModule, MatInputModule, MatTooltipModule, MatError, MatHint, MatDatepickerModule, ReactiveFormsModule, MatTooltip, MatLabel, MatFormField, MatInput],
})
export class KlesFormDateComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
