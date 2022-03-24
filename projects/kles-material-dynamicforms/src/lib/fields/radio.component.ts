import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-radiobutton',
    template: `
    <div [formGroup]="group">
        <label class="radio-label-padding">{{field.label}}</label>
        <mat-radio-group matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name">
            <mat-radio-button *ngFor="let item of field.options" [value]="item">{{item}}</mat-radio-button>
        </mat-radio-group>
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
                <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
            </ng-container>
            <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
                <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
            </ng-container>
    </div>
`,
    styles: []
})
export class KlesFormRadioComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}