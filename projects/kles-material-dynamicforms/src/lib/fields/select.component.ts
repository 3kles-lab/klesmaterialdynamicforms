import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-select',
    template: `
    <mat-form-field class="margin-top" [color]="field.color" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id"
        (openedChange)="openChange($event)" [compareWith]="compareFn"
        [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        <mat-select-trigger *ngIf="field.triggerComponent">
            <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value" [field]="field"></ng-container>
        </mat-select-trigger>


        <ng-container *ngIf="!field.virtualScroll">
            <ng-container *ngIf="!field.autocompleteComponent">
                <mat-option *ngFor="let item of options$ | async" [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
            </ng-container>

            <ng-container *ngIf="field.autocompleteComponent">
                <mat-option *ngFor="let item of options$ | async" [value]="item" [disabled]="item?.disabled">
                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                </mat-option>
            </ng-container>
        </ng-container>

        <ng-container *ngIf="field.virtualScroll">
            <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 50" [style.height.px]=5*48>
                <ng-container *ngIf="!field.autocompleteComponent">
                    <mat-option *cdkVirtualFor="let item of options$ | async" [value]="item"  [disabled]="item?.disabled">
                    {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                    </mat-option>

                    <ng-container *ngIf="field.multiple">
                        <mat-option *ngFor="let item of group.controls[field.name].value | slice:0:30" [value]="item"
                        style="display:none">
                            {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                        </mat-option>
                    </ng-container>

                    <ng-container *ngIf="!field.multiple && group.controls[field.name].value">
                    <mat-option *ngFor="let item of [group?.controls[field.name]?.value]" [value]="item" style="display:none">
                            {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                        </mat-option>
                    </ng-container>
                </ng-container>

                <ng-container *ngIf="field.autocompleteComponent">
                    <mat-option *cdkVirtualFor="let item of options$ | async" [value]="item" [disabled]="item?.disabled">
                        <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                    </mat-option>
                    <ng-container *ngIf="field.multiple">
                        <mat-option *ngFor="let item of group.controls[field.name].value | slice:0:30" [value]="item"
                        style="display:none">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>
                    </ng-container>
                    <ng-container *ngIf="!field.multiple && group.controls[field.name].value">
                        <mat-option *ngFor="let item of [group?.controls[field.name]?.value]" [value]="item" style="display:none">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>
                    </ng-container>
                </ng-container>
            </cdk-virtual-scroll-viewport>

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
export class KlesFormSelectComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
    @ViewChildren(MatOption) options: QueryList<MatOption>;

    options$: Observable<any[]>;

    constructor() {
        super();
    }

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

    openChange($event: boolean) {
        if (this.field.virtualScroll) {
            if ($event) {
                this.cdkVirtualScrollViewport.scrollToIndex(0);
                this.cdkVirtualScrollViewport.checkViewportSize();
            }
        }
    }

    compareFn = (o1: any, o2: any) => {
        if (this.field.property && o1 && o2) {
            return o1[this.field.property] === o2[this.field.property];
        }
        return o1 === o2;
    }
}
