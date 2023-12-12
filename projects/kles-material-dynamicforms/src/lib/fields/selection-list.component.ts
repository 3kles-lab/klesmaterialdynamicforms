import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-selection-list',
    template: `
    <div class="margin-top" [formGroup]="group">
        <mat-selection-list [attr.id]="field.id" [multiple]="field.multiple" [ngClass]="field.ngClass"
        (selectionChange)="onSelectionChange($event)">

            @if(field.virtualScroll){
                <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 20" style="height:100%">
                    @if (!field.autocompleteComponent) {
                        <mat-list-option *cdkVirtualFor="let item of (options$ | async); templateCacheSize: 0"
                        [value]="item" [selected]="selection.isSelected(item)">
                            {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                        </mat-list-option>
                    }
                    @else{
                        <mat-list-option *cdkVirtualFor="let item of (options$ | async); templateCacheSize: 0"
                        [value]="item" [selected]="selection.isSelected(item)">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-list-option>
                    }
                    
                </cdk-virtual-scroll-viewport>
            }
            @else{
                @if (!field.autocompleteComponent) {
                    @for (item of options$ | async; track item) {
                        <mat-list-option [value]="item">
                            {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                        </mat-list-option>
                    }
                }
                @else {
                    @for (item of options$ | async; track item) {
                        <mat-list-option [value]="item">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-list-option>
                    }
                }
            }            
        </mat-selection-list>
    </div>
`,
    styles: [`
        mat-selection-list {width: 100%;height: 250px; overflow:auto}`
    ],
})
export class KlesFormSelectionListComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    selection: SelectionModel<any>;
    options$: Observable<any[]>;

    ngOnInit() {
        super.ngOnInit();

        this.selection = new SelectionModel<any>(this.field.multiple || false);
        this.field.virtualScroll
        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options;
        }
        else if (this.field.options instanceof Function) {
            this.options$ = this.field.options();
        }
        else {
            this.options$ = of(this.field.options);
        }

        this.selection.changed.subscribe(change => {
            this.group.controls[this.field.name].patchValue(change.source.selected);
        });
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onSelectionChange(selection: MatSelectionListChange) {
        selection.options.forEach(option => {
            option.selected ? this.selection.select(option.value)
                : this.selection.deselect(option.value)
        });
    }
}
