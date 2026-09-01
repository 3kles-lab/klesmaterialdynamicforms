import { AsyncPipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInput, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { combineLatest, concat, isObservable, map, Observable, of, ReplaySubject, startWith, switchMap } from 'rxjs';

import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { KlesTransformPipe } from '../pipe/transform.pipe';
import { KlesFieldAbstract } from './field.abstract';

interface ChipOptionsState {
    loading: boolean;
    options: any[];
}

@Component({
    selector: 'kles-form-chip-grid',
    template: `
        <mat-form-field [formGroup]="group" [matTooltip]="tooltip()" [appearance]="appearance()">
            <mat-label>{{ label() }}</mat-label>

            <mat-chip-grid #reactiveChipGrid [formControl]="control">
                @for (value of control.value; track $index) {
                    <mat-chip-row [value]="value" (removed)="removeChip(value)">
                        {{ displayValue(value) | klesTransform: field.pipeTransform }}

                        <button matChipRemove>
                            <mat-icon>cancel</mat-icon>
                        </button>
                    </mat-chip-row>
                }
            </mat-chip-grid>

            <input
                #chipInput="matChipInput"
                [formControl]="searchControl"
                [placeholder]="placeholder()"
                [matChipInputFor]="reactiveChipGrid"
                [matAutocomplete]="auto"
                [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                (matChipInputTokenEnd)="onTokenEnd($event)"
                (focus)="onFocus()"
                (blur)="onBlur()"
            />

            <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selected($event, chipInput)">
                @if (filteredOption$ | async; as filteredOption) {
                    @if (filteredOption.loading) {
                        <mat-option disabled>
                            <div class="loadingSelect">
                                {{ intl.loading }}...

                                <mat-spinner class="spinner" diameter="20" />
                            </div>
                        </mat-option>
                    } @else {
                        @for (item of filteredOption.options; track item) {
                            <mat-option [value]="item" [disabled]="item?.disabled ?? false">
                                {{ displayValue(item) | klesTransform: field.pipeTransform }}
                            </mat-option>
                        }
                    }
                }
            </mat-autocomplete>

            <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations" />
        </mat-form-field>
    `,
    styles: [
        `
            mat-form-field {
                width: 100%;
            }
        `,
    ],
    styleUrls: ['../styles/mat-suffix.style.scss', '../styles/mat-field-bottom.style.scss', '../styles/loading-select.style.scss'],
    standalone: true,
    imports: [AsyncPipe, KlesTransformPipe, MatAutocompleteModule, MatChipsModule, MatError, MatErrorMessageDirective, MatFormFieldModule, MatIconModule, MatProgressSpinnerModule, MatTooltip, ReactiveFormsModule],
})
export class KlesFormChipGridComponent extends KlesFieldAbstract implements OnInit {
    readonly control = this.group.controls[this.field.name] as FormControl<any[]>;

    readonly intl = inject(KlesDynamicFormIntl);

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    /*
     * any est volontaire :
     * MatAutocomplete peut momentanément pousser l'objet
     * sélectionné dans le FormControl de recherche.
     */
    readonly searchControl = new FormControl<any>('', {
        nonNullable: true,
    });

    filteredOption$!: Observable<ChipOptionsState>;

    private options$!: Observable<ChipOptionsState>;

    /*
     * ReplaySubject permet de ne pas perdre le premier focus
     * si l'Observable lazy n'est pas encore abonné.
     */
    private readonly loadOptions$ = new ReplaySubject<void>(1);

    override ngOnInit(): void {
        this.options$ = this.createOptionsStream();

        this.filteredOption$ = combineLatest([this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)), this.options$, this.control.valueChanges.pipe(startWith(this.control.value ?? []))]).pipe(
            map(([search, response, selectedValues]) => {
                if (response.loading) {
                    return response;
                }

                const selected = Array.isArray(selectedValues) ? selectedValues : [];

                /*
                 * On retire de la liste les options
                 * déjà présentes dans les chips.
                 */
                let options = response.options.filter((option) => !selected.some((selectedValue) => this.isSameOption(option, selectedValue)));

                /*
                 * Le contrôle peut momentanément contenir
                 * un objet pendant une sélection autocomplete.
                 */
                if (typeof search === 'string' && search.trim()) {
                    options = this.filterData(search, options);
                }

                return {
                    loading: false,
                    options,
                };
            }),
        );

        super.ngOnInit();
    }

    override onFocus(): void {
        if (this.field.lazy) {
            this.loadOptions$.next();
        }

        super.onFocus();
    }

    onTokenEnd(event: MatChipInputEvent): void {
        /*
         * Quand property est renseignée, les valeurs sont
         * considérées comme des objets provenant de l'autocomplete.
         *
         * On évite donc d'ajouter une string libre au tableau.
         */
        if (this.field.property) {
            return;
        }

        const value = event.value.trim();

        if (!value) {
            return;
        }

        this.addChip(value);

        event.chipInput.clear();
        this.searchControl.setValue('');
    }

    addChip(value: unknown): void {
        if (value === null || value === undefined || value === '') {
            return;
        }

        const values = Array.isArray(this.control.value) ? this.control.value : [];

        /*
         * Empêche d'ajouter deux fois la même valeur.
         */
        const exists = values.some((currentValue) => this.isSameOption(currentValue, value));

        if (exists) {
            return;
        }

        this.control.setValue([...values, value]);

        this.control.markAsDirty();
    }

    removeChip(value: unknown): void {
        const values = Array.isArray(this.control.value) ? [...this.control.value] : [];

        const index = values.findIndex((currentValue) => this.isSameOption(currentValue, value));

        if (index === -1) {
            return;
        }

        values.splice(index, 1);

        this.control.setValue(values);
        this.control.markAsDirty();
    }

    selected(event: MatAutocompleteSelectedEvent, chipInput: MatChipInput): void {
        const value = event.option.value;

        /*
         * On ajoute d'abord l'objet sélectionné aux chips.
         */
        this.addChip(value);

        /*
         * L'autocomplete n'est ici qu'une source de sélection.
         * La sélection réelle est représentée par les chips.
         */
        event.option.deselect();

        /*
         * Important :
         * MatChipInput.clear() nettoie réellement l'input HTML.
         */
        chipInput.clear();

        /*
         * Et on synchronise le FormControl afin de :
         * - vider l'état Angular ;
         * - supprimer le filtre ;
         * - recalculer filteredOption$.
         */
        this.searchControl.setValue('');
    }

    displayValue(value: any): any {
        if (value === null || value === undefined) {
            return '';
        }

        if (this.field.property) {
            return value?.[this.field.property] ?? '';
        }

        return value;
    }

    private createOptionsStream(): Observable<ChipOptionsState> {
        /*
         * Lazy :
         * recharge les options à chaque focus.
         */
        if (this.field.lazy) {
            return this.loadOptions$.pipe(
                switchMap(() =>
                    concat(
                        of({
                            loading: true,
                            options: [],
                        }),
                        this.resolveOptions().pipe(
                            map((options) => ({
                                loading: false,
                                options,
                            })),
                        ),
                    ),
                ),
            );
        }

        /*
         * Liste statique :
         * aucun chargement à afficher.
         */
        if (Array.isArray(this.field.options)) {
            return of({
                loading: false,
                options: this.field.options,
            });
        }

        /*
         * Observable ou fonction :
         * spinner jusqu'à réception des options.
         */
        return concat(
            of({
                loading: true,
                options: [],
            }),
            this.resolveOptions().pipe(
                map((options) => ({
                    loading: false,
                    options,
                })),
            ),
        );
    }

    private resolveOptions(): Observable<any[]> {
        const source = typeof this.field.options === 'function' ? this.field.options() : this.field.options;

        if (isObservable(source)) {
            return source;
        }

        return of(source ?? []);
    }

    private filterData(search: unknown, options: any[]): any[] {
        if (typeof search !== 'string') {
            return options;
        }

        const filterValue = search.trim().toLowerCase();

        if (!filterValue) {
            return options;
        }

        return options.filter((option) => {
            const value = this.displayValue(option);

            return String(value ?? '')
                .toLowerCase()
                .startsWith(filterValue);
        });
    }

    private isSameOption(a: any, b: any): boolean {
        /*
         * Primitive identique ou même référence objet.
         */
        if (a === b) {
            return true;
        }

        /*
         * En mode objet, property sert actuellement
         * également à identifier les doublons.
         */
        if (this.field.property && a !== null && a !== undefined && b !== null && b !== undefined) {
            return a[this.field.property] === b[this.field.property];
        }

        return false;
    }
}
