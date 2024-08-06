import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { startWith, map, switchMap, take, withLatestFrom, takeUntil, distinctUntilChanged, filter } from 'rxjs/operators';
import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@FieldMapper({ type: EnumType.input })
@Component({
    selector: 'kles-form-input',
    template: `
    <mat-form-field [formGroup]="group" [color]="field.color" [subscriptSizing]="field.subscriptSizing" class="form-element" [appearance]="field.appearance" class="field-bottom">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }

        @if (field.autocomplete) {
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step"
            [matAutocomplete]="auto"
            (focus)="onFocus()" (blur)="onBlur()" >

            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="this.field.panelWidth">
                @if(filteredOption$ | async; as filteredOption){
                    @if(filteredOption.loading){
                        <mat-option disabled>
                            <div class="loadingSelect">{{'loading' | translate}}... 
                                <mat-spinner class="spinner" diameter="20"></mat-spinner>
                            </div>
                        </mat-option>
                    }@else{
                        @if (!field.autocompleteComponent) {
                            @for (option of filteredOption.options; track option) {
                                <mat-option [value]="option">
                                    {{field.property ? option[field.property] : option}}
                                </mat-option>
                            }
                        }
                        @else {
                            @for (option of filteredOption.options; track option) {
                                <mat-option [value]="option">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="option" [field]="field">
                                    </ng-container>
                                </mat-option>
                            }
                        }
                    
                    }
                    
                }
            </mat-autocomplete>
        }
        @else {
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step" (focus)="onFocus()" (blur)="onBlur()">
        }
        @if (field.hint) {
            <mat-hint>{{field.hint}}</mat-hint>
        }

        @if (field.subComponents || field.clearable || isPending()) {
            <div matSuffix class="suffix">
                @if(isPending()){
                    <mat-spinner mode="indeterminate" diameter="21"></mat-spinner>
                }
                @if(field.subComponents || field.clearable){
                    <ng-content></ng-content>
                }
                
            </div>
        }

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
  
    </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    styleUrls: [
        '../styles/mat-suffix.style.scss',
        '../styles/mat-field-bottom.style.scss',
        '../styles/loading-select.style.scss',
    ]
})
export class KlesFormInputComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    filteredOption$: Observable<{ loading: boolean, options: any[] }>;
    options$: Observable<{ loading: boolean, options: any[] }>;
    private isFocused = new Subject<boolean>();
    isLoading = signal(false);

    ngOnInit(): void {

        if (this.field.lazy) {
            this.options$ = this.isFocused.pipe(
                distinctUntilChanged(),
                filter((isFocused) => isFocused),
                switchMap((isFocused) => {
                    if (isFocused) {
                        let obs$: Observable<any[]>;
                        if (this.field.options instanceof Observable) {
                            obs$ = this.field.options;
                        }
                        else if (this.field.options instanceof Function) {
                            obs$ = this.field.options();
                        }
                        else {
                            obs$ = of(this.field.options);
                        }
                        return concat(
                            of({ loading: true, options: [] }),
                            obs$.pipe(
                                map((options: any[]) => {
                                    return { loading: false, options };
                                }))
                        )

                    } else {
                        return of({ loading: false, options: [] });
                    }
                })
            );
        } else {
            if (this.field.options instanceof Observable) {
                this.options$ = concat(
                    of({ loading: true, options: [] }),
                    this.field.options.pipe(
                        map((options: any[]) => {
                            return { loading: false, options };
                        }))
                );
            }
            else if (this.field.options instanceof Function) {
                this.options$ = concat(of({ loading: true, options: [] }), this.field.options().pipe(
                    map((options: any[]) => {
                        return { loading: false, options };
                    })));
            }
            else {
                this.options$ = of({ loading: false, options: this.field.options });
            }
        }


        this.filteredOption$ = concat(
            combineLatest([this.group.get(this.field.name).valueChanges.pipe(startWith('')), this.options$])
                .pipe(
                    map(([data, response]) => {
                        if (response.loading) {
                            return response;
                        } else {
                            return { loading: false, options: ((data && response.options) ? this.filterData(data, response.options) : response.options) }
                        }

                    })
                )
        );


        if (!this.field.maxLength) {
            this.field.maxLength = 524288; // Max default input W3C
        }
        super.ngOnInit();
    }

    onFocus() {
        if (this.field.autocomplete && this.field.lazy) {
            this.isFocused.next(true);
        }

        super.onFocus();
    }

    private filterData(value: any, options: any[]): any[] {
        let filterValue;

        if (typeof value === 'string' && Object.prototype.toString.call(value) === '[object String]') {
            filterValue = value.toLowerCase();
        } else {
            filterValue = value[this.field.property].toLowerCase();
        }

        if (this.field.property) {
            return options.filter(option => option[this.field.property].toLowerCase().indexOf(filterValue) === 0);
        }
        return options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }

    displayFn(value: any) {
        if (this.field.displayWith) {
            return this.field.displayWith(value);
        } else {
            if (value && this.field && this.field.property) {
                return value[this.field.property] ? value[this.field.property] : '';
            }
            return value ? value : '';
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
