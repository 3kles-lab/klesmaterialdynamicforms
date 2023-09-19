import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { KlesFormSelectSearchComponent } from './select.search.component';

@Component({
    selector: 'kles-form-select-lazy-search',
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
                <ngx-mat-select-search [formControl]="searchControl" [clearSearchInput]="false"
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
                <ngx-mat-select-search [formControl]="searchControl" [clearSearchInput]="false" 
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

        <div matSuffix>
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
export class KlesFormSelectLazySearchComponent extends KlesFormSelectSearchComponent implements OnInit, OnDestroy {

    constructor(protected viewRef: ViewContainerRef, protected ref: ChangeDetectorRef) {
        super(viewRef, ref);
    }

    ngOnInit() {
        this.field.lazy = true;
        this.field.debounceTime = this.field.debounceTime ? this.field.debounceTime : 500;
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected onSearchChange(value: string): Observable<any[]> {
        if (this.field.options instanceof Function) {
            if (this.openChange$.getValue() && this.field.options instanceof Function) {
                if (value) {
                    return this.field.options(value).pipe(take(1));
                } else {
                    return this.field.options().pipe(take(1));
                }
            }
            return of(this.group.controls[this.field.name].value ? [this.group.controls[this.field.name].value] : []);
        }
        else {
            return super.onSearchChange(value);
        }
    }

    protected openChangeEvent(): void {
        this.openChange$
            .pipe(
                takeUntil(this._onDestroy),
                switchMap((isOpen) => {
                    return this.onOpenChange(isOpen).pipe(map((options) => ({ options, isOpen })));
                })
            )
            .subscribe(({ options, isOpen }) => {
                if (!isOpen) {
                    this.searchControl.reset(null, { emitEvent: false });
                }
                this.optionsFiltered$.next(options);
                this.isLoading = false;
                this.ref.markForCheck();
            });
    }
}
