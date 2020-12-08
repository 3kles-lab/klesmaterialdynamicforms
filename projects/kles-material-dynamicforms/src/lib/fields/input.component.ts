import { FieldAbstract } from './field.abstract';
import { OnInit, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-input',
    template: `
    <mat-form-field [formGroup]="group" class="form-element">

        <ng-container *ngIf="field.autocomplete; else notAutoComplete">
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [matAutocomplete]="auto">

            <mat-autocomplete #auto="matAutocomplete">
                <mat-option *ngFor="let option of filteredOption | async" [value]="option">{{option}}</mat-option>
            </mat-autocomplete>
        </ng-container>
        
        <ng-template #notAutoComplete>
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType">
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
export class InputComponent extends FieldAbstract implements OnInit {

    filteredOption: Observable<any[]>;

    ngOnInit(): void {
        this.filteredOption = this.group.get(this.field.name).valueChanges
            .pipe(
                startWith(''),
                map(data => data ? this.filterData(data) : this.field.options.slice())
            );
        super.ngOnInit();
    }

    isPending() {
        return this.group.controls[this.field.name].pending;
    }

    private filterData(value: any): any[] {
        const filterValue = value.toLowerCase();
        return this.field.options.filter(data => data.toLowerCase().indexOf(filterValue) === 0);
    }
}
