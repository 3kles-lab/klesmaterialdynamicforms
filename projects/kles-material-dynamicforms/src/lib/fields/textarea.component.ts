import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'kles-form-textarea',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" [formGroup]="group" [color]="field.color" class="form-element" [appearance]="field.appearance">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }

        <textarea matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        [formControlName]="field.name" cdkTextareaAutosize [placeholder]="field.placeholder"
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
    styles: ['mat-form-field {width: calc(100%)}'],
    standalone: true,
    imports: [CommonModule, MatErrorMessageDirective, ScrollingModule, ReactiveFormsModule, MatTooltip, MatLabel, MatFormField, TextFieldModule, MatInput]
})
export class KlesFormTextareaComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
