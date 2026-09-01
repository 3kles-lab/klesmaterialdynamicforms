import { OnInit, Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { KlesFormInputComponent } from './input.component';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule, MatOption } from '@angular/material/autocomplete';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { KlesComponentDirective } from '../directive/dynamic-component.directive';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

@Component({
    selector: 'kles-form-input-clearable',
    template: `
        <mat-form-field [subscriptSizing]="field.subscriptSizing" [formGroup]="group" [color]="color()" class="form-element" [appearance]="appearance()">
            @if (label()) {
                <mat-label>{{ label() }}</mat-label>
            }
            @if (field.autocomplete) {
                <input
                    matInput
                    [matTooltip]="tooltip()"
                    [attr.id]="field.id"
                    [ngClass]="ngClass()"
                    [formControlName]="field.name"
                    [placeholder]="placeholder()"
                    [type]="inputType()"
                    [maxLength]="maxLength()"
                    [min]="min()"
                    [max]="max()"
                    [step]="step()"
                    [matAutocomplete]="auto"
                />

                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="this.field.panelWidth">
                    @if (filteredOption$ | async; as filteredOption) {
                        @if (filteredOption.loading) {
                            <mat-option class="hide-checkbox" disabled>
                                <div class="loadingSelect">
                                    {{ intl.loading }}...
                                    <mat-spinner class="spinner" diameter="20"></mat-spinner>
                                </div>
                            </mat-option>
                        } @else {
                            @if (!field.autocompleteComponent) {
                                @for (option of filteredOption.options; track option) {
                                    <mat-option [value]="option">
                                        {{ field.property ? option[field.property] : option }}
                                    </mat-option>
                                }
                            } @else {
                                @for (option of filteredOption.options; track option) {
                                    <mat-option [value]="option">
                                        <ng-container klesComponent [component]="field.autocompleteComponent" [value]="option" [field]="field"> </ng-container>
                                    </mat-option>
                                }
                            }
                        }
                    }
                </mat-autocomplete>
            } @else {
                <input
                    matInput
                    [matTooltip]="tooltip()"
                    [attr.id]="field.id"
                    [ngClass]="ngClass()"
                    [formControlName]="field.name"
                    [placeholder]="placeholder()"
                    [type]="inputType()"
                    [maxLength]="maxLength()"
                    [min]="min()"
                    [max]="max()"
                    [step]="step()"
                />
            }
            @if (!group.get(field.name).disabled) {
                <button matSuffix matIconButton aria-label="Clear" type="button" (click)="group.controls[field.name].reset()">
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
    styleUrls: ['../styles/loading-select.style.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatErrorMessageDirective, MatProgressSpinner, MatIcon, MatTooltip, KlesComponentDirective, MatOption, MatInput, MatLabel, MatFormField],
})
export class KlesFormInputClearableComponent extends KlesFormInputComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
