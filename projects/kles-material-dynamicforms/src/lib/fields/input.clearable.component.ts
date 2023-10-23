import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFormInputComponent } from './input.component';

@Component({
    selector: 'kles-form-input-clearable',
    template: `
    <mat-form-field [formGroup]="group" [color]="field.color" class="form-element">

        <ng-container *ngIf="field.autocomplete; else notAutoComplete">
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step"
            [matAutocomplete]="auto" [errorStateMatcher]="field.errorStateMatcher">

            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="this.field.panelWidth">
                <ng-container *ngIf="!field.autocompleteComponent">
                    <mat-option *ngFor="let option of filteredOption | async" [value]="option">
                        {{field.property ? option[field.property] : option}}
                    </mat-option>
                </ng-container>

                <ng-container *ngIf="field.autocompleteComponent">
                    <mat-option *ngFor="let option of filteredOption | async" [value]="option">
                        <ng-container klesComponent [component]="field.autocompleteComponent" [value]="option" [field]="field">
                        </ng-container>
                    </mat-option>
                </ng-container>
            </mat-autocomplete>
        </ng-container>

        <ng-template #notAutoComplete>
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step"
            [errorStateMatcher]="field.errorStateMatcher">
        </ng-template>
        <button *ngIf="!group.get(field.name).disabled" mat-button matSuffix mat-icon-button aria-label="Clear" type="button"
            (click)="group.controls[field.name].reset();">
            <mat-icon>close</mat-icon>
        </button>

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
export class KlesFormInputClearableComponent extends KlesFormInputComponent implements OnInit, OnDestroy {

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
