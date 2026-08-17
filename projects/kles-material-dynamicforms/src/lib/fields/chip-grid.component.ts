import { MatIconModule } from '@angular/material/icon';
import { KlesTransformPipe } from '../pipe/transform.pipe';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { combineLatest, concat, distinctUntilChanged, filter, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';

@Component({
    selector: 'kles-form-chip-grid',
    template: `
        <div [formGroup]="group">
            <mat-form-field [matTooltip]="tooltip()">
                <mat-label>{{ label() }}</mat-label>
                <mat-chip-grid #reactiveChipGrid [formControl]="group.controls[field.name]">
                    @for (value of group.controls[field.name].value ?? []; track value) {
                        <mat-chip-row (removed)="removeChip(value)">
                            {{ value | klesTransform: field.pipeTransform }}
                            <button matChipRemove>
                                <mat-icon>cancel</mat-icon>
                            </button>
                        </mat-chip-row>
                    }
                </mat-chip-grid>
                <input
                    #search
                    [formControl]="searchControl"
                    [placeholder]="placeholder()"
                    [matChipInputFor]="reactiveChipGrid"
                    (matChipInputTokenEnd)="onTokenEnd($event)"
                    [matAutocomplete]="auto"
                    [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                    (focus)="onFocus()"
                    (blur)="onBlur()"
                />

                <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event); search.value = ''">
                    @if (filteredOption$ | async; as filteredOption) {
                        @if (filteredOption.loading) {
                            <mat-option disabled>
                                <div class="loadingSelect">
                                    {{ intl.loading }}...
                                    <mat-spinner class="spinner" diameter="20"></mat-spinner>
                                </div>
                            </mat-option>
                        } @else {
                            @for (item of filteredOption.options; track item) {
                                <mat-option [value]="item" [disabled]="item?.disabled">{{ (field.property ? item[field.property] : item) | klesTransform: field.pipeTransform }}</mat-option>
                            }
                        }
                    }
                </mat-autocomplete>
            </mat-form-field>
        </div>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    styleUrls: ['../styles/mat-suffix.style.scss', '../styles/mat-field-bottom.style.scss', '../styles/loading-select.style.scss'],
    standalone: true,
    imports: [MatIconModule, KlesTransformPipe, MatChipsModule, MatTooltip, ReactiveFormsModule, MatFormFieldModule, MatAutocompleteModule, AsyncPipe, MatProgressSpinnerModule],
})
export class KlesFormChipGridComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    options = this.field.options as any[];

    private readonly control = this.group.controls[this.field.name];
    public intl = inject(KlesDynamicFormIntl);

    filteredOption$!: Observable<{ loading: boolean; options: any[] }>;
    options$!: Observable<{ loading: boolean; options: any[] }>;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    private isFocused = new Subject<boolean>();

    searchControl = new FormControl('aaa');

    ngOnInit() {
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
                this.options$ = of({ loading: false, options: this.field.options });
            }
        }

        this.filteredOption$ = concat(
            combineLatest([this.searchControl?.valueChanges.pipe(startWith('')) ?? of(''), this.options$]).pipe(
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onFocus() {
        if (this.field.lazy) {
            this.isFocused.next(true);
        }

        super.onFocus();
    }

    onTokenEnd(event: MatChipInputEvent): void {
        this.addChip(event.value);
        event.chipInput.clear();
    }

    addChip(rawValue: string): void {
        const value = (rawValue || '').trim();

        if (value) {
            this.control.setValue([...(this.control.value ?? []), value]);
        }
    }

    removeChip(value: string) {
        const values = this.control.value;
        const index = values.lastIndexOf(value);

        if (index > -1) {
            values.splice(index, 1);
            this.control.setValue(values);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.addChip(event.option.viewValue);
        event.option.deselect();
        this.searchControl.reset();
    }

    private filterData(value: any, options: any[]): any[] {
        let filterValue = undefined;
        const property = this.field.property;

        if (typeof value === 'string' && Object.prototype.toString.call(value) === '[object String]') {
            filterValue = value.toLowerCase();
        } else {
            if (property) {
                filterValue = value[property]?.toLowerCase();
            }
        }

        if (filterValue != undefined) {
            if (property) {
                return options.filter((option) => option[property].toLowerCase().indexOf(filterValue) === 0);
            }
            return options.filter((option) => option.toLowerCase().indexOf(filterValue) === 0);
        } else {
            return options;
        }
    }
}
