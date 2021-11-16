import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-select-search',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        (openedChange)="openChange($event)"
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
                <ng-container *ngIf="!field.autocompleteComponent">
                    <mat-checkbox *ngIf="field.multiple" class="selectAll" [formControl]="selectAllControl"
                    (change)="toggleAllSelection($event)">
                        {{'selectAll' | translate}}
                    </mat-checkbox>
                    <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
                    
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
                    <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item">
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

        <ng-container *ngIf="!field.virtualScroll">
           
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl"
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>
            
            <mat-checkbox *ngIf="field.multiple" class="selectAll" [formControl]="selectAllControl"
                    (change)="toggleAllSelection($event)">
                    {{'selectAll' | translate}}
            </mat-checkbox>

            <ng-container *ngIf="!field.autocompleteComponent">
                <mat-option *ngFor="let item of optionsFiltered$ | async" [value]="item">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
            </ng-container>

            <ng-container *ngIf="field.autocompleteComponent">
                <mat-option *ngFor="let item of optionsFiltered$ | async" [value]="item">
                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                </mat-option>
            </ng-container>
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
    styles: ['mat-form-field {width: calc(100%)}', '.selectAll {padding: 10px 16px;}']
})
export class KlesFormSelectSearchComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    searchControl = new FormControl();
    selectAllControl = new FormControl(false);


    options$: Observable<any[]>;
    optionsFiltered$ = new ReplaySubject<any[]>(1);

    private _onDestroy = new Subject<void>();

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
    @ViewChildren(MatOption) options: QueryList<MatOption>;

    ngOnInit() {
        super.ngOnInit();

        if (!(this.field.options instanceof Observable)) {
            this.options$ = of(this.field.options);
        } else {
            this.options$ = this.field.options;
        }

        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            takeUntil(this._onDestroy),
            switchMap(value => {
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
            })
        ).subscribe(this.optionsFiltered$);

        this.group.controls[this.field.name]
        .valueChanges.pipe(
            takeUntil(this._onDestroy),
            startWith(this.group.controls[this.field.name].value),
            switchMap(selected => {
                return this.optionsFiltered$.pipe(map(options => {
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

    ngOnDestroy(): void {
        this._onDestroy.next();
    }


    toggleAllSelection(state) {
        if (state.checked) {
            this.optionsFiltered$.pipe(take(1)).subscribe(options => {
                if (options.length > 0) {
                    this.group.controls[this.field.name].patchValue(options.slice());
                }
            })

        } else {
            this.group.controls[this.field.name].patchValue([]);
        }
    }

    openChange($event: boolean) {
        if (this.field.virtualScroll) {
            if ($event) {
                this.cdkVirtualScrollViewport.scrollToIndex(0);
                this.cdkVirtualScrollViewport.checkViewportSize();
            }
        }
    }
}
