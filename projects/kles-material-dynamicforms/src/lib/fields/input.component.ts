import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'kles-form-input',
    template: `
    <mat-form-field [formGroup]="group" class="form-element">

        <ng-container *ngIf="field.autocomplete; else notAutoComplete">
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [matAutocomplete]="auto">

            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="this.field.panelWidth">
                <ng-container *ngIf="!field.autocompleteComponent">
                    <mat-option *ngFor="let option of filteredOption | async" [value]="option">
                        {{field.property ? option[field.property] : option}}
                    </mat-option>
                </ng-container>

                <ng-container *ngIf="field.autocompleteComponent">
                    <mat-option *ngFor="let option of filteredOption | async" [value]="option">
                        <ng-container klesComponent [component]="field.autocompleteComponent" [value]="option">
                        </ng-container>
                    </mat-option>
                </ng-container>
            </mat-autocomplete>
        </ng-container>

        <ng-template #notAutoComplete>
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [step]="field.step" [placeholder]="field.placeholder | translate" [type]="field.inputType">
        </ng-template>

        <mat-spinner matSuffix mode="indeterminate" *ngIf="isPending()" diameter="17"></mat-spinner>

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
export class KlesFormInputComponent extends KlesFieldAbstract implements OnInit {

    filteredOption: Observable<any[]>;
    options$: Observable<any[]>;

    ngOnInit(): void {

        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options;
        } else {
            this.options$ = of(this.field.options);
        }


        this.filteredOption = this.group.get(this.field.name).valueChanges
            .pipe(
                startWith(''),
                // map(data => data ? this.filterData(data) : this.field.options.slice())
                switchMap(data => data ? this.filterData(data) : this.options$)
            );
        super.ngOnInit();
    }

    isPending() {
        return this.group.controls[this.field.name].pending;
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
}
