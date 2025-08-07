import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFormRange } from '../controls/range.control';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

@FieldMapper({ type: EnumType.range, factory: (field) => new KlesFormRange(field).create() })
@Component({
    selector: 'kles-form-rangepicker',
    template: `
        <mat-form-field [subscriptSizing]="field.subscriptSizing" [color]="field.color" [formGroup]="group" [appearance]="field.appearance">
            <mat-label>{{ field.label }}</mat-label>

            <mat-date-range-input [formGroupName]="field.name" [rangePicker]="picker" matTooltip="{{ field.tooltip }}" [attr.id]="field.id" [ngClass]="field.ngClass" [min]="field.min" [max]="field.max">
                <input matStartDate formControlName="start" [placeholder]="(field.placeholder?.start ? field.placeholder?.start : '') | translate" />
                <input matEndDate formControlName="end" [placeholder]="(field.placeholder?.end ? field.placeholder?.end : '') | translate" />
            </mat-date-range-input>

            <div matSuffix class="suffix">
                <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
                <ng-content></ng-content>
            </div>

            <mat-date-range-picker #picker></mat-date-range-picker>
            @if (field.hint) {
            <mat-hint>{{ field.hint }}</mat-hint>
            }

            <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
        </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    styleUrls: ['../styles/mat-suffix.style.scss'],
    standalone: true,
    imports: [CommonModule, TranslateModule, MatErrorMessageDirective, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatTooltipModule, ReactiveFormsModule],
})
export class KlesFormRangeComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    // range = new FormGroup({
    //     start: new FormControl<Date | null>(null),
    //     end: new FormControl<Date | null>(null),
    // });

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
