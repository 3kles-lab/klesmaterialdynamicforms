import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component, OnDestroy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';

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
            [matAutocomplete]="auto">

            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="this.field.panelWidth">
                @if (!field.autocompleteComponent) {
                    @for (option of filteredOption | async; track option) {
                        <mat-option [value]="option">
                            {{field.property ? option[field.property] : option}}
                        </mat-option>
                    }
                }
                @else {
                    @for (option of filteredOption | async; track option) {
                        <mat-option [value]="option">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="option" [field]="field">
                            </ng-container>
                        </mat-option>
                    }
                }
            </mat-autocomplete>
        }
        @else {
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step">
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
        '../styles/mat-field-bottom.style.scss'
    ]
})
export class KlesFormInputComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    filteredOption: Observable<any[]>;
    options$: Observable<any[]>;

    ngOnInit(): void {

        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options;
        }
        else if (this.field.options instanceof Function) {
            this.options$ = this.field.options();
        }
        else {
            this.options$ = of(this.field.options);
        }


        this.filteredOption = this.group.get(this.field.name).valueChanges
            .pipe(
                startWith(''),
                switchMap(data => data ? this.filterData(data) : this.options$)
            );
        if (!this.field.maxLength) {
            this.field.maxLength = 524288; // Max default input W3C
        }
        super.ngOnInit();
    }

    private filterData(value: any): Observable<any[]> {
        let filterValue;

        if (typeof value === 'string' && Object.prototype.toString.call(value) === '[object String]') {
            filterValue = value.toLowerCase();
        } else {
            filterValue = value[this.field.property].toLowerCase();
        }

        if (this.field.property) {
            return this.options$
                .pipe(map(options => options.filter(option => option[this.field.property].toLowerCase().indexOf(filterValue) === 0)));
        }
        return this.options$.pipe(map(options => options.filter(option => option.toLowerCase().indexOf(filterValue) === 0)));
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
