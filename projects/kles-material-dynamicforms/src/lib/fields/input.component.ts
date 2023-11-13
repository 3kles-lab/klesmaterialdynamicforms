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
    <mat-form-field [formGroup]="group" [color]="field.color" class="form-element">
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

        @if (isPending()) {
            <mat-spinner matSuffix mode="indeterminate" diameter="17"></mat-spinner>
        }

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
    styles: ['mat-form-field {width: calc(100%)}']
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
                // map(data => data ? this.filterData(data) : this.field.options.slice())
                switchMap(data => data ? this.filterData(data) : this.options$)
            );
        if (!this.field.maxLength) {
            this.field.maxLength = 524288; // Max default input W3C
        }
        super.ngOnInit();
    }

    isPending() {
        return (this.group.controls[this.field.name].pending || this.field.pending);
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
            // return this.field.options
            //     .filter(data => data[this.field.property].toLowerCase().indexOf(filterValue) === 0);
        }
        // return this.field.options.filter(data => data.toLowerCase().indexOf(filterValue) === 0);
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
