import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, scan, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-select-search',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        (infiniteScroll)="getNextBatch()" [complete]="offset === size" msInfiniteScroll
        [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        <mat-select-trigger *ngIf="field.triggerComponent">
            <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value"></ng-container>
        </mat-select-trigger>

        <mat-option>
            <ngx-mat-select-search [formControl]="searchControl" [disableScrollToActiveOnOptionsChanged]="true"
            placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
        </mat-option>
        
        <mat-checkbox *ngIf="field.multiple" class="selectAll" [formControl]="selectAllControl"
                (change)="toggleAllSelection($event)">
                {{'selectAll' | translate}}
        </mat-checkbox>
        

        <ng-container *ngIf="!field.autocompleteComponent">
            <mat-option *ngFor="let item of optionsDisplayed$ | async" [value]="item">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
        </ng-container>

        <ng-container *ngIf="field.autocompleteComponent">
            <mat-option *ngFor="let item of optionsDisplayed$ | async" [value]="item">
                <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item"></ng-container>
            </mat-option>
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
    private optionsFiltered$ = new ReplaySubject<any[]>(1);
    optionsDisplayed$: Observable<any[]>;

    private _onDestroy = new Subject<void>();
    private data: any[] = [];
    private optionsLoaded$ = new BehaviorSubject<string[]>([]);

    limit = 20;
    offset = 0;
    size = 0;

    ngOnInit() {
        super.ngOnInit();

        if (!(this.field.options instanceof Observable)) {
            this.options$ = of(this.field.options);
        } else {
            this.options$ = this.field.options;
        }

        this.options$.pipe(takeUntil(this._onDestroy))
            .subscribe(options => {
                this.data = [...options];
                this.size = this.data.length;
                this.searchControl.reset();
            });

        this.optionsDisplayed$ = this.optionsLoaded$.asObservable();

        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            takeUntil(this._onDestroy),
            map(value => {
                if (value) {
                    const search = value.toLowerCase();
                    return this.data.filter(option => {
                        if (this.field.property) {
                            return option[this.field.property].toString().toLowerCase().indexOf(search) > -1;
                        }
                        return option.toString().toLowerCase().indexOf(search) > -1;
                    })
                } else {
                    return this.data;
                }
            })
        ).subscribe(options => {
            this.resetOffset();
            this.optionsFiltered$.next(options);
            this.getNextBatch();
        });

        this.group.controls[this.field.name].valueChanges.pipe(
            takeUntil(this._onDestroy),
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

    private resetOffset() {
        this.offset = 0;
    }

    getNextBatch() {
        this.optionsFiltered$.pipe(
            take(1),
            map(options => options.slice(0, this.offset + this.limit))
        ).subscribe(options => {
            this.optionsLoaded$.next(options);
            this.offset += this.limit;
        })
    }
}