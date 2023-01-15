import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.select })
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
                <ng-container *ngIf="!isLoading; else emptyOption">
                    <mat-option *ngFor="let item of options$ | async" [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
                </ng-container>
            </ng-container>

            <ng-container *ngIf="field.autocompleteComponent">
                <ng-container *ngIf="!isLoading; else emptyOption">
                        <mat-option *ngFor="let item of options$ | async" [value]="item" [disabled]="item?.disabled">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>
                </ng-container>
            </ng-container>
            <ng-template #emptyOption>
                <mat-option class="hide-checkbox" disabled><div fxLayout="row" fxLayoutAlign="space-between center">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
            </ng-template>
        </ng-container>

        <ng-container *ngIf="field.virtualScroll">
            <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 50" [style.height.px]=5*48>
                <ng-container *ngIf="!field.autocompleteComponent">
                    <ng-container *ngIf="!isLoading; else emptyOption">
                        <mat-option *cdkVirtualFor="let item of options$ | async" [value]="item"  [disabled]="item?.disabled">
                        {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                        </mat-option>
                    </ng-container>

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
                    <ng-container *ngIf="!isLoading; else emptyOption">
                        <mat-option *cdkVirtualFor="let item of options$ | async" [value]="item" [disabled]="item?.disabled">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>
                    </ng-container>
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

                <ng-template #emptyOption>
                    <mat-option class="hide-checkbox" disabled><div fxLayout="row" fxLayoutAlign="space-between center">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
                </ng-template>
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
    styles: ['mat-form-field {width: calc(100%)}',
        `::ng-deep .hide-checkbox .mat-pseudo-checkbox { display: none !important;  }`]
})
export class KlesFormSelectComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
    @ViewChildren(MatOption) options: QueryList<MatOption>;

    options$: Observable<any[]>;

    isLoading = false;

    openChange$ = new Subject<boolean>();

    constructor(protected viewRef: ViewContainerRef, protected ref: ChangeDetectorRef) {
        super(viewRef);
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.field.lazy) {
            this.isLoading = true;
            if (this.field.value) {
                this.options$ = new BehaviorSubject<any[]>(Array.isArray(this.group.controls[this.field.name].value) ? this.group.controls[this.field.name].value
                    : [this.group.controls[this.field.name].value]);
                this.isLoading = false;
            } else {
                this.options$ = new BehaviorSubject<any[]>([]);
            }

            this.openChange$
                .pipe(
                    takeUntil(this._onDestroy),
                    switchMap((isOpen) => {
                        if (isOpen) {
                            if (!(this.field.options instanceof Observable)) {
                                return of(this.field.options);
                            } else {
                                this.isLoading = true;
                                return this.field.options.pipe(take(1));
                            }
                        } else {
                            return of(this.group.controls[this.field.name].value !== undefined ? [this.group.controls[this.field.name].value] : [])
                        }
                    })
                )
                .subscribe((options) => {
                    (this.options$ as BehaviorSubject<any[]>).next(options);
                    this.isLoading = false;
                    this.ref.markForCheck();
                });

        } else {
            if (!(this.field.options instanceof Observable)) {
                this.options$ = of(this.field.options);
            } else {
                this.options$ = this.field.options;
            }
        }


    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    openChange($event: boolean) {
        if (this.field.lazy) {
            this.openChange$.next($event);
            // if ($event) {
            //     if (!(this.field.options instanceof Observable)) {
            //         (this.options$ as BehaviorSubject<any[]>).next(this.field.options);
            //     } else {
            //         this.isLoading = true;
            //         this.field.options.pipe(take(1)).subscribe(options => {
            //             (this.options$ as BehaviorSubject<any[]>).next(options);
            //             this.isLoading = false;
            //             this.ref.markForCheck();
            //         });
            //     }
            // } else {
            //     (this.options$ as BehaviorSubject<any[]>)
            //         .next(this.group.controls[this.field.name].value !== undefined ? [this.group.controls[this.field.name].value] : []);
            //     this.ref.markForCheck();
            //     // this.isLoading = true;
            // }
        }

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
