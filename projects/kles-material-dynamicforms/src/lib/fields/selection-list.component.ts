import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';
import { takeUntil } from 'rxjs/operators';
import { KlesSelectionModel } from '../selection/selection-model';
@Component({
    selector: 'kles-form-selection-list',
    template: `
    <div class="margin-top" [formGroup]="group">
        <mat-selection-list [attr.id]="field.id" [multiple]="field.multiple" [ngClass]="field.ngClass"
        (selectionChange)="onSelectionChange($event)">
            @if(options$ | async; as options){
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
    styles: [`
        mat-selection-list {width: 100%;height: 250px; overflow:auto}`
    ],
})
export class KlesFormSelectionListComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    selection: KlesSelectionModel<any>;
    options$: Observable<any[]>;

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
            this.options$ = this.field.options;
        }
        else if (this.field.options instanceof Function) {
            this.options$ = this.field.options();
        }
        else {
            this.options$ = of(this.field.options);
        }

        this.group.controls[this.field.name].valueChanges
            .pipe(
                takeUntil(this._onDestroy),
            ).subscribe((value) => {
                this.selection.setSelection(Array.isArray(value) ? value : [value], { emitEvent: false });
            });

        this.selection.changed.pipe(takeUntil(this._onDestroy)).subscribe(change => {
            this.group.controls[this.field.name].patchValue(change.source.selected);
            this.group.controls[this.field.name].markAllAsTouched();
            this.group.controls[this.field.name].markAsDirty();
        });
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
