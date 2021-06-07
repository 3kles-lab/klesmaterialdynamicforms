import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'app-select-search',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
            
        <mat-option>
            <ngx-mat-select-search [formControl]="searchControl"
            placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
        </mat-option>

        
        <mat-checkbox *ngIf="field.multiple" class="selectAll" [formControl]="selectAllControl"
                (change)="toggleAllSelection($event)">
                {{'selectAll' | translate}}
        </mat-checkbox>
        
        <mat-option *ngFor="let item of optionsFiltered$ | async" [value]="item">{{field.property ? item[field.property] : item}}</mat-option>
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
    private _onDestroy = new Subject<void>();

    options$: Observable<any[]>;
    optionsFiltered$ = new ReplaySubject<any[]>(1);

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
                        return options.map(option => {
                            if (this.field.property) {
                                return option[this.field.property];
                            }
                            return option;
                        }).filter(option => option.toLowerCase().indexOf(search) > -1)
                    }))
                } else {
                    return this.options$;
                }
            })
        ).subscribe(this.optionsFiltered$);

        this.group.controls[this.field.name].valueChanges.pipe(
            takeUntil(this._onDestroy),
            switchMap(selected => {
                return this.optionsFiltered$.pipe(map(options => {
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
}