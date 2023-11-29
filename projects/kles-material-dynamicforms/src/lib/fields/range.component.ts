import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFormRange } from "../controls/range.control";
import { FieldMapper } from "../decorators/component.decorator";
import { EnumType } from "../enums/type.enum";
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.range, factory: (field) => (new KlesFormRange(field).create()) })
@Component({
    selector: "kles-form-rangepicker",
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" [color]="field.color" [formGroup]="group">

        <mat-label>{{field.label}}</mat-label>

        <mat-date-range-input [formGroupName]="field.name" [rangePicker]="picker" matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        [min]="field.min" [max]="field.max" >
            <input matStartDate formControlName="start" [placeholder]="(field.placeholder?.start ? field.placeholder?.start : '') | translate">
            <input matEndDate formControlName="end" [placeholder]="(field.placeholder?.end ? field.placeholder?.end : '') | translate">
        </mat-date-range-input>
        
        <div matSuffix>
            <mat-datepicker-toggle [for]="picker" matSuffix></mat-datepicker-toggle>
            <ng-content></ng-content>
        </div>

        <mat-date-range-picker #picker></mat-date-range-picker>
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
