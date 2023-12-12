import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { KlesFormSelectSearchComponent } from './select.search.component';

@Component({
    selector: 'kles-form-select-lazy-search',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" class="margin-top" [color]="field.color" [formGroup]="group">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }

        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        (openedChange)="openChange($event)" [compareWith]="compareFn" [panelWidth]="field.panelWidth || 'auto'"
        [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        @if (field.triggerComponent) {
            <mat-select-trigger>
                <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value" [field]="field"></ng-container>
            </mat-select-trigger>
        }

        @if (field.virtualScroll) {
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl" [clearSearchInput]="false"
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>

            <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 50" [style.height.px]=4*48>
                @if (!isLoading) {
                    @if (field.multiple) {
                        <mat-checkbox class="selectAll mat-mdc-option mdc-list-item" [formControl]="selectAllControl" (change)="toggleAllSelection($event)">
                            {{'selectAll' | translate}}
                        </mat-checkbox>
                    }

                    @if (!field.autocompleteComponent) {
                        <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>

                        @if (field.multiple) {
                            @for (item of group.controls[field.name].value | slice:0:30; track item) {
                                <mat-option [value]="item" style="display:none">
                                    {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                                </mat-option>
                            }
                        }

                        @if (!field.multiple && group.controls[field.name].value) {
                            @for (item of [group?.controls[field.name]?.value]; track item) {
                                <mat-option [value]="item" style="display:none">
                                    {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                                </mat-option>
                            }
                        }
                    }
                    @else {
                        <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>

                        @if (field.multiple) {
                            @for (item of group.controls[field.name].value | slice:0:30; track item) {
                                <mat-option [value]="item" style="display:none">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                                </mat-option>
                            }
                        }

                        @if (!field.multiple && group.controls[field.name].value) {
                            @for (item of [group?.controls[field.name]?.value]; track item) {
                                <mat-option [value]="item" style="display:none">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                                </mat-option>
                            }
                        }
                    }
                }
                @else {
                    <mat-option class="hide-checkbox" disabled><div class="loadingSelect">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
                }
            </cdk-virtual-scroll-viewport>
        }
        @else {
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl" [clearSearchInput]="false" 
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>

            @if (!isLoading) {
                @if (field.multiple) {
                    <mat-checkbox class="selectAll mat-mdc-option mdc-list-item" [formControl]="selectAllControl" (change)="toggleAllSelection($event)">
                        {{'selectAll' | translate}}
                    </mat-checkbox>
                }

                @if (!field.autocompleteComponent) {
                    @for (item of optionsFiltered$ | async; track item) {
                        <mat-option [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
                    }
                }
                @else {
                    @for (item of optionsFiltered$ | async; track item) {
                        <mat-option [value]="item" [disabled]="item?.disabled">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>
                    }
                }
            }
            @else {
                <mat-option class="hide-checkbox" disabled><div class="loadingSelect">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
            }
        }

        </mat-select>

        @if (field.subComponents || field.clearable) {
            <div matSuffix>
                <ng-content></ng-content>
            </div>
        }

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
    </mat-form-field>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        '.selectAll {padding: 0 16px 0 5px; display: flex !important;}',
        '.selectAll .mdc-form-field {width: 100%;}',
        '.selectAll .mdc-form-field .mdc-label {width: 100%;  min-height: 48px; align-items: center; display: flex;}',
        '.selectAll .mdc-form-field .mdc-checkbox__ripple {display: none !important;}',
        `::ng-deep .hide-checkbox .mat-pseudo-checkbox { display: none !important;  }`],
    styleUrls: ['../styles/loading-select.style.scss']
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
