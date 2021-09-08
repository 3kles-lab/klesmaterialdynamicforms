import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, scan, take, takeUntil } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-select',
    template: `
    <mat-form-field class="margin-top" [formGroup]="group">
        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        (infiniteScroll)="getNextBatch()" [complete]="offset === size" msInfiniteScroll
        [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple">
        <mat-select-trigger *ngIf="field.triggerComponent">
            <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value"></ng-container>
        </mat-select-trigger>

        
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
    styles: ['mat-form-field {width: calc(100%)}']
})
export class KlesFormSelectComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    options$: Observable<any[]>;
    optionsDisplayed$: Observable<any[]>;

    private optionsLoaded$ = new BehaviorSubject<string[]>([]);
    private _onDestroy = new Subject<void>();
    private data: any[];

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

        this.options$
            .pipe(takeUntil(this._onDestroy))
            .subscribe(options => {
                this.size = options.length;
                this.data = [...options];
                this.getNextBatch();
            });

        this.optionsDisplayed$ = this.optionsLoaded$.asObservable().pipe(
            scan((acc, curr) => {
                return [...acc, ...curr];
            }, [])
        );

    }

    ngOnDestroy(): void {
        this._onDestroy.next();
    }

    getNextBatch() {
        this.optionsLoaded$.next(this.data.slice(this.offset, this.offset + this.limit));
        this.offset += this.limit;
    }
}