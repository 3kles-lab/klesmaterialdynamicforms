import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-selection-list',
    template: `
    <div class="margin-top" [formGroup]="group">
        <mat-selection-list [formControlName]="field.name" [attr.id]="field.id" [multiple]="field.multiple" [ngClass]="field.ngClass">
            <ng-container *ngIf="!field.autocompleteComponent">
                <mat-list-option [value]="item" *ngFor="let item of options$ | async;">
                    {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                </mat-list-option>
            </ng-container>

            <ng-container *ngIf="field.autocompleteComponent">
                <mat-list-option  *ngFor="let item of options$ | async;" [value]="item">
                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                </mat-list-option>
            </ng-container>
        </mat-selection-list>
    </div>
`,
    styles: ['mat-selection-list {width: calc(100%);height: 250px; overflow:auto}'],
})
export class KlesFormSelectionListComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    options$: Observable<any[]>;

    ngOnInit() {
        super.ngOnInit();

        if (!(this.field.options instanceof Observable)) {
            this.options$ = of(this.field.options);
        } else {
            this.options$ = this.field.options;
        }
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
