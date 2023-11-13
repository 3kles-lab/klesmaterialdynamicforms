import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'kles-form-radiobutton',
    template: `
    <div [formGroup]="group">
        <label class="radio-label-padding">{{field.label}}</label>
        <mat-radio-group matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name">
            @for (item of options$ | async; track item) {
                <mat-radio-button [value]="item">{{item}}</mat-radio-button>
            }
        </mat-radio-group>
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
    </div>
`,
    styles: []
})
export class KlesFormRadioComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    options$: Observable<any[]>;

    ngOnInit() {
        super.ngOnInit();

        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options;
        }
        else if (this.field.options instanceof Function) {
            this.options$ = this.field.options();
        }
        else {
            this.options$ = of(this.field.options);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}