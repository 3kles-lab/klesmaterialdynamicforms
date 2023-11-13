import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-textarea',
    template: `
    <mat-form-field [formGroup]="group" [color]="field.color" class="form-element">
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
export class KlesFormTextareaComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
