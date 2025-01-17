import { Component, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: 'kles-form-textarea',
    template: `
    <mat-form-field [formGroup]="group" class="form-element">
        <textarea matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" 
        [formControlName]="field.name" cdkTextareaAutosize [placeholder]="field.placeholder | translate"
        [cdkAutosizeMinRows]="field.textareaAutoSize?.minRows" [cdkAutosizeMaxRows]="field.textareaAutoSize?.maxRows">
        </textarea>


        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
    </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}']
})
export class KlesFormTextareaComponent extends KlesFieldAbstract implements OnInit {
    ngOnInit(): void {
        super.ngOnInit();
    }
}