import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-select',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        <mat-select-trigger *ngIf="field.triggerComponent">
            <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value"></ng-container>
        </mat-select-trigger>

        
        <ng-container *ngIf="!field.autocompleteComponent">
            <mat-option *ngFor="let item of options$ | async" [value]="item">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
        </ng-container>

        <ng-container *ngIf="field.autocompleteComponent">
            <mat-option *ngFor="let item of options$ | async" [value]="item">
                <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item"></ng-container>
            </mat-option>
        </ng-container>

       
        </mat-select>
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
export class KlesFormSelectComponent extends KlesFieldAbstract implements OnInit {

    options$: Observable<any[]>;

    ngOnInit() {
        super.ngOnInit();

        if (!(this.field.options instanceof Observable)) {
            this.options$ = of(this.field.options);
        } else {
            this.options$ = this.field.options;
        }

    }
}