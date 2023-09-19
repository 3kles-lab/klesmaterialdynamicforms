import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ViewEncapsulation } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { BehaviorSubject, concat, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-select-search',
    template: `
    <mat-form-field class="margin-top" [color]="field.color" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        (openedChange)="openChange($event)" [compareWith]="compareFn"
        [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        <mat-select-trigger *ngIf="field.triggerComponent">
            <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value" [field]="field"></ng-container>
        </mat-select-trigger>

        <ng-container *ngIf="field.virtualScroll">
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl"
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>

            <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 50" [style.height.px]=4*48>
                <ng-container *ngIf="!isLoading; else emptyOption">
                    <mat-checkbox *ngIf="field.multiple" class="selectAll" [formControl]="selectAllControl"
                    (change)="toggleAllSelection($event)">
                        {{'selectAll' | translate}}
                    </mat-checkbox>
                    <ng-container *ngIf="!field.autocompleteComponent">
                        <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>

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
                        <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">
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
                </ng-container>
                <ng-template #emptyOption>
                    <mat-option class="hide-checkbox" disabled><div fxLayout="row" fxLayoutAlign="space-between center">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
                </ng-template>
            </cdk-virtual-scroll-viewport>

        </ng-container>

        <ng-container *ngIf="!field.virtualScroll">
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl"
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>

            <ng-container *ngIf="!isLoading; else emptyOption">
                <mat-checkbox *ngIf="field.multiple" class="selectAll" [formControl]="selectAllControl"
                        (change)="toggleAllSelection($event)">
                        {{'selectAll' | translate}}
                </mat-checkbox>
                <ng-container *ngIf="!field.autocompleteComponent">
                    <mat-option *ngFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
                </ng-container>

                <ng-container *ngIf="field.autocompleteComponent">
                    <mat-option *ngFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">
                        <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                    </mat-option>
                </ng-container>
            </ng-container>

            <ng-template #emptyOption>
                <mat-option class="hide-checkbox" disabled><div fxLayout="row" fxLayoutAlign="space-between center">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
            </ng-template>
        </ng-container>
        </mat-select>

        <div matSuffix *ngIf="field.subComponents || field.clearable">
            <ng-content></ng-content>
        </div>
        
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
                <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
            </ng-container>
            <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
                <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
            </ng-container>
    </mat-form-field>
`,
    styles: ['mat-form-field {width: calc(100%)}', '.selectAll {padding: 10px 16px;}',
        `::ng-deep .hide-checkbox .mat-pseudo-checkbox { display: none !important;  }`],
})
export class KlesFormSelectSearchComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    searchControl = new UntypedFormControl();
    selectAllControl = new UntypedFormControl(false);

    isLoading = false;

    options$: Observable<any[]>;
    optionsFiltered$ = new ReplaySubject<any[]>(1);

    openChange$ = new BehaviorSubject<boolean>(false);

    // private _onDestroy = new Subject<void>();

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
    @ViewChildren(MatOption) options: QueryList<MatOption>;

    constructor(protected viewRef: ViewContainerRef, protected ref: ChangeDetectorRef) {
        super(viewRef);
    }

    ngOnInit() {
        super.ngOnInit();

        if (this.field.lazy) {
            this.isLoading = true;
            if (this.group.controls[this.field.name].value !== undefined && this.group.controls[this.field.name].value !== null) {
                this.options$ = new BehaviorSubject<any[]>(Array.isArray(this.group.controls[this.field.name].value) ? this.group.controls[this.field.name].value : [this.group.controls[this.field.name].value]);
                this.isLoading = false;
            } else {
                this.options$ = new BehaviorSubject<any[]>([]);
            }

            this.openChangeEvent();
        } else {
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

        this.searchControl.valueChanges.pipe(
            takeUntil(this._onDestroy),
            debounceTime(this.field.debounceTime || 0),
            startWith(this.searchControl.value),
            switchMap(value => {
                return concat(
                    of({ loading: true, options: [] }),
                    this.onSearchChange(value).pipe(map((options) => ({ loading: false, options })))
                )

            })
        ).subscribe(({ loading, options }) => {
            this.isLoading = loading;
            this.optionsFiltered$.next(options);
            this.ref.markForCheck();
        });

        if (this.field.multiple) {
            this.group.controls[this.field.name]
                .valueChanges.pipe(
                    takeUntil(this._onDestroy),
                    startWith(this.group.controls[this.field.name].value),
                    map((selected) => (this.field.property ? selected?.map(s => s[this.field.property]) : selected)),
                    switchMap(selected => {
                        return this.optionsFiltered$.pipe(
                            map((options) => options?.filter((option) => !option?.disabled).map((option) => (this.field.property ? option[this.field.property] : option))),
                            map(options => {
                                if (!selected) {
                                    return false;
                                }
                                if (options.length < selected.length) {
                                    return options.length > 0 && options.every(o => selected.includes(o));
                                } else {
                                    return options.length > 0 && options.length === selected.length && selected.every(s => options.includes(s));
                                }
                            }));
                    })
                ).subscribe(isChecked => {
                    this.selectAllControl.setValue(isChecked);
                });
        }
    }

    ngOnDestroy(): void {
        // this._onDestroy.next();
        super.ngOnDestroy();
    }


    toggleAllSelection(state) {
        if (state.checked) {
            this.optionsFiltered$.pipe(take(1), map((options) => options.filter((option) => !option?.disabled))).subscribe(options => {
                if (options.length > 0) {
                    this.group.controls[this.field.name].patchValue(options.slice());
                }
            });

        } else {
            this.group.controls[this.field.name].patchValue([]);
        }
    }


    protected openChangeEvent(): void {
        this.openChange$
            .pipe(
                takeUntil(this._onDestroy),
                switchMap((isOpen) => {
                    return this.onOpenChange(isOpen);
                })
            )
            .subscribe((options) => {
                (this.options$ as BehaviorSubject<any[]>).next(options);
                this.isLoading = false;
                this.ref.markForCheck();
            });
    }

    protected onOpenChange(isOpen: boolean): Observable<any[]> {
        if (isOpen) {

            if (this.field.options instanceof Observable) {
                this.isLoading = true;
                return this.field.options.pipe(take(1));
            }
            else if (this.field.options instanceof Function) {
                this.isLoading = true;
                return this.field.options().pipe(take(1));
            }
            else {
                return of(this.field.options);
            }
        } else {
            return of(this.group.controls[this.field.name].value !== undefined && this.group.controls[this.field.name].value !== null
                ? (Array.isArray(this.group.controls[this.field.name].value) ?
                    this.group.controls[this.field.name].value : [this.group.controls[this.field.name].value]) : [])
        }
    }

    protected onSearchChange(value: string): Observable<any[]> {
        if (value) {
            const search = value.toLowerCase();
            return this.options$.pipe(map(options => {
                return options
                    .filter(option => {
                        if (this.field.searchKeys && this.field.searchKeys.length) {
                            return this.field.searchKeys.some(searchKey => {
                                if (option[searchKey]) {
                                    return option[searchKey].toString().toLowerCase().indexOf(search) > -1;
                                }
                                return false;
                            }) || (this.field.property ?
                                option[this.field.property].toString().toLowerCase().indexOf(search) > -1 : false);

                        } else {
                            if (this.field.property) {
                                return option[this.field.property].toString().toLowerCase().indexOf(search) > -1;
                            }
                        }
                        return option.toString().toLowerCase().indexOf(search) > -1;
                    });
            }));
        } else {
            return this.options$;
        }
    }

    openChange($event: boolean) {
        if (this.field.lazy) {
            this.openChange$.next($event);
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
