import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-textarea',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" [formGroup]="group" [color]="field.color" class="form-element" [appearance]="field.appearance">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }

        <textarea matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        [formControlName]="field.name" cdkTextareaAutosize [placeholder]="field.placeholder | translate"
        [cdkAutosizeMinRows]="field.textareaAutoSize?.minRows" [cdkAutosizeMaxRows]="field.textareaAutoSize?.maxRows"  [maxlength]="field.maxLength">
        </textarea>

        @if (field.subComponents || field.clearable) {
            <div matSuffix>
                <ng-content></ng-content>
            </div>
        }

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
    </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}']
})
export class KlesFormTextareaComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
