import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFormInputComponent } from './input.component';

@Component({
    selector: 'kles-form-input-clearable',
    template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" [formGroup]="group" [color]="field.color" class="form-element" [appearance]="field.appearance">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }

        @if (field.autocomplete) {
            <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType"
            [maxLength]="field.maxLength" [min]="field.min" [max]="field.max" [step]="field.step"
            [matAutocomplete]="auto">

            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="this.field.panelWidth">
                @if(filteredOption$ | async; as filteredOption){
                    @if(filteredOption.loading){
                        <mat-option class="hide-checkbox" disabled>
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

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
    </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    styleUrls: ['../styles/loading-select.style.scss',]
})
export class KlesFormInputClearableComponent extends KlesFormInputComponent implements OnInit, OnDestroy {

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
