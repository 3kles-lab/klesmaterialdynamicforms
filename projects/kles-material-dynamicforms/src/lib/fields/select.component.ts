import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'app-select',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        <mat-select-trigger>
            <ng-container *ngIf="group.controls[field.name].value">
                <ng-container *ngIf="field.multiple; else unique">
                    {{group.controls[field.name].value | arrayFormat:field.property}}
                </ng-container>
                <ng-template #unique>
                    {{field.property ? group.controls[field.name].value[field.property] : group.controls[field.name].value}}
                </ng-template>
            </ng-container>
        </mat-select-trigger>

        
        <mat-option *ngFor="let item of options$ | async" [value]="item">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
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