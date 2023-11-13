import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFormInputComponent } from './input.component';

@Component({
    selector: 'kles-form-input-clearable',
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
                    <mat-option *ngFor="let option of filteredOption | async" [value]="option">
                        {{field.property ? option[field.property] : option}}
                    </mat-option>
                }
                @else {
                    <mat-option *ngFor="let option of filteredOption | async" [value]="option">
                        <ng-container klesComponent [component]="field.autocompleteComponent" [value]="option" [field]="field">
                        </ng-container>
                    </mat-option>
                }
            </mat-autocomplete>
        }
        @else {
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step">
        }

        @if (!group.get(field.name).disabled) {
            <button matSuffix mat-icon-button aria-label="Clear" type="button" (click)="group.controls[field.name].reset();">
                <mat-icon>close</mat-icon>
            </button>
        }

        @if (isPending()) {
            <mat-spinner matSuffix mode="indeterminate" diameter="17"></mat-spinner>
        }

        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            @if (group.get(field.name).hasError(validation.name)) {
                <mat-error>{{validation.message | translate}}</mat-error>
            }
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            @if (group.get(field.name).hasError(validation.name)) {
                <mat-error>{{validation.message | translate}}</mat-error>
            }
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
