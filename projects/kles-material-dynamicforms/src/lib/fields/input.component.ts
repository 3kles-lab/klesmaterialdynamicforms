import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component, OnDestroy, signal, ViewContainerRef, computed, inject } from '@angular/core';
import { combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { startWith, map, switchMap, distinctUntilChanged, filter } from 'rxjs/operators';
import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { KlesComponentDirective } from '../directive/dynamic-component.directive';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { MatIconModule } from '@angular/material/icon';
import { KlesFocusTargetDirective } from '../directive/focus-target.directive';

@FieldMapper({ type: EnumType.input })
@Component({
    selector: 'kles-form-input',
    template: `
        <mat-form-field [formGroup]="group" [color]="color()" [subscriptSizing]="field.subscriptSizing ?? 'fixed'" class="form-element" [appearance]="appearance()" class="field-bottom">
            @if (label()) {
                <mat-label>{{ label() }}</mat-label>
            }
            @if (icon()) {
                <mat-icon matPrefix>{{ icon() }}</mat-icon>
            }

            @if (field.autocomplete) {
                <input
                    klesFocusTarget
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
                    (focus)="onFocus()"
                    (blur)="onBlur()"
                />

                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn.bind(this)" [panelWidth]="field.panelWidth ?? 'auto'">
                    @if (filteredOption$ | async; as filteredOption) {
                        @if (filteredOption.loading) {
                            <mat-option disabled>
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
                    klesFocusTarget
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
                    (focus)="onFocus()"
                    (blur)="onBlur()"
                />
            }
            @if (hint()) {
                <mat-hint>{{ hint() }}</mat-hint>
            }
            @if (field.subComponents || field.clearable || isPending()) {
                <div matSuffix class="suffix">
                    @if (isPending()) {
                        <mat-spinner mode="indeterminate" diameter="21"></mat-spinner>
                    }
                    @if (field.subComponents || field.clearable) {
                        <ng-content></ng-content>
                    }
                </div>
            }

            <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
        </mat-form-field>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    styleUrls: ['../styles/mat-suffix.style.scss', '../styles/mat-field-bottom.style.scss', '../styles/loading-select.style.scss'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatTooltipModule, MatProgressSpinnerModule, MatOptionModule, MatError, MatErrorMessageDirective, KlesComponentDirective, MatIconModule, KlesFocusTargetDirective],
})
export class KlesFormInputComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    filteredOption$!: Observable<{ loading: boolean; options: any[] }>;
    options$!: Observable<{ loading: boolean; options: any[] }>;
    private isFocused = new Subject<boolean>();
    isLoading = signal(false);

    public intl = inject(KlesDynamicFormIntl);

    constructor() {
        super();
        if (this.maxLength() === undefined) {
            this.ui?.get(this.field.name)?.patchValue({ maxLength: 524288 }); // Max default input W3C
        }
    }

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
                        } else if (this.field.options instanceof Function) {
                            obs$ = this.field.options();
                        } else {
                            obs$ = of(this.field.options ?? []);
                        }
                        return concat(
                            of({ loading: true, options: [] }),
                            obs$.pipe(
                                map((options: any[]) => {
                                    return { loading: false, options };
                                }),
                            ),
                        );
                    } else {
                        return of({ loading: false, options: [] });
                    }
                }),
            );
        } else {
            if (this.field.options instanceof Observable) {
                this.options$ = concat(
                    of({ loading: true, options: [] }),
                    this.field.options.pipe(
                        map((options: any[]) => {
                            return { loading: false, options };
                        }),
                    ),
                );
            } else if (this.field.options instanceof Function) {
                this.options$ = concat(
                    of({ loading: true, options: [] }),
                    this.field.options().pipe(
                        map((options: any[]) => {
                            return { loading: false, options };
                        }),
                    ),
                );
            } else {
                this.options$ = of({ loading: false, options: this.field.options ?? [] });
            }
        }

        this.filteredOption$ = concat(
            combineLatest([this.group.get(this.field.name)?.valueChanges.pipe(startWith('')) ?? of(''), this.options$]).pipe(
                map(([data, response]) => {
                    if (response.loading) {
                        return response;
                    } else {
                        return { loading: false, options: data && response.options ? this.filterData(data, response.options) : response.options };
                    }
                }),
            ),
        );

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
        const property = this.field.property;

        if (typeof value === 'string' && Object.prototype.toString.call(value) === '[object String]') {
            filterValue = value.toLowerCase();
        } else if (property) {
            filterValue = value[property]?.toString().toLowerCase() ?? '';
        } else {
            filterValue = value?.toString().toLowerCase() ?? '';
        }

        if (property) {
            return options.filter((option) => option[property]?.toString().toLowerCase().indexOf(filterValue) === 0);
        }
        return options.filter((option) => option?.toString().toLowerCase().indexOf(filterValue) === 0);
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
