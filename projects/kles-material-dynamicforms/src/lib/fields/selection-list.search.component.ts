import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';
import { debounceTime, distinctUntilChanged, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { KlesSelectionModel } from '../selection/selection-model';
import { FormControl } from '@angular/forms';
@Component({
    selector: 'kles-form-selection-list-search',
    template: `
    <div class="selection-list" [formGroup]="group">
        <mat-form-field subscriptSizing='dynamic'>
            @if (field.label) {
                <mat-label>{{field.label}}</mat-label>
            }
            <input matInput [placeholder]="field.placeholder" [formControl]="searchControl">
            <button matSuffix mat-icon-button aria-label="Clear" (click)="searchControl.reset();$event.stopPropagation();">
                <mat-icon>close</mat-icon>
            </button>
        </mat-form-field>

        <mat-selection-list [attr.id]="field.id" [multiple]="field.multiple" [ngClass]="field.ngClass"
        (selectionChange)="onSelectionChange($event)">
            @if(optionFiltered$ | async; as options){
                @if(field.virtualScroll){
                    <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 20" style="height:100%">
                        @if (!field.autocompleteComponent) {
                            <mat-list-option *cdkVirtualFor="let item of options; templateCacheSize: 0"
                            [value]="item" [selected]="selection.isSelected(item)">
                                {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                            </mat-list-option>
                        }
                        @else{
                            <mat-list-option *cdkVirtualFor="let item of options; templateCacheSize: 0"
                            [value]="item" [selected]="selection.isSelected(item)">
                                <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                            </mat-list-option>
                        }
                    </cdk-virtual-scroll-viewport>
                }
                @else{
                    @if (!field.autocompleteComponent) {
                        @for (item of options; track item) {
                            <mat-list-option [value]="item" [selected]="selection.isSelected(item)">
                                {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                            </mat-list-option>
                        }
                    }
                    @else {
                        @for (item of options; track item) {
                            <mat-list-option [value]="item" [selected]="selection.isSelected(item)">
                                <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                            </mat-list-option>
                        }
                    }
                }   

            }@else{
                <mat-spinner></mat-spinner>
            }
        </mat-selection-list>
    </div>
`,
    styles: [
        `.selection-list {display:flex; flex-direction:column; gap:5px}`,
        `mat-selection-list {width: 100%;height: 250px; overflow:auto; flex-grow: 1;}`
    ],
})
export class KlesFormSelectionListSearchComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    selection: KlesSelectionModel<any>;
    options$: Observable<any[]>;
    searchControl = new FormControl();

    optionFiltered$: Observable<any[]>;

    ngOnInit() {
        super.ngOnInit();

        this.selection = new KlesSelectionModel<any>(this.field.multiple || false, [], true,
            ((o1: any, o2: any) => {
                if (this.field.property) {
                    return o1?.[this.field.property] === o2?.[this.field.property];
                } else {
                    return o1 === o2;
                }
            }));

        if (this.field.value) {
            this.selection.select(Array.isArray(this.field.value) ? this.field.value : [this.field.value]);
        }

        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options.pipe(shareReplay(1));
        }

        this.group.controls[this.field.name].valueChanges
            .pipe(
                takeUntil(this._onDestroy),
            ).subscribe((value) => {
                this.selection.setSelection(Array.isArray(value) ? value : [value], { emitEvent: false });
            });

        this.selection.changed.pipe(takeUntil(this._onDestroy)).subscribe(change => {
            this.group.controls[this.field.name].patchValue(change.source.selected);
        });

        this.optionFiltered$ = this.searchControl.valueChanges
            .pipe(
                takeUntil(this._onDestroy),
                startWith(null as string),
                debounceTime(this.field.debounceTime || 0),
                distinctUntilChanged(),
                map((value) => value?.toLowerCase()),
                switchMap((value) => {
                    if (this.field.options instanceof Function) {
                        return this.field.options(value);
                    } else {
                        return ((this.field.options instanceof Observable) ? this.options$ : of(this.field.options)).pipe(
                            map((options) => {
                                if (!value) {
                                    return options;
                                }
                                return options.filter(option => {
                                    return (!this.field.property && option?.toString().toLowerCase().includes(value))
                                        || (this.field.property && option?.[this.field.property]?.toString().toLowerCase().includes(value))
                                        || (this.field.searchKeys && this.field.searchKeys.some(key => option?.[key].toString().toLowerCase().includes(value)));
                                });
                            })
                        );
                    }
                })
            )
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onSelectionChange(selection: MatSelectionListChange) {
        selection.options.forEach(option => {
            option.selected ? this.selection.select([option.value])
                : this.selection.deselect([option.value])
        });
    }
}
