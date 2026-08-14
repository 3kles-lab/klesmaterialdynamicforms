import { ChangeDetectorRef, Component, computed, DEFAULT_CURRENCY_CODE, Directive, ElementRef, forwardRef, HostListener, inject, Input, LOCALE_ID, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { KlesFieldAbstract } from './field.abstract';

/**
 * ValueAccessor monétaire.
 *
 * La valeur du FormControl reste un number | null.
 * Seule la valeur affichée dans l'input est formatée.
 */
@Directive({
    selector: 'input[klesCurrency]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesCurrencyValueAccessorDirective),
            multi: true,
        },
    ],
})
export class KlesCurrencyValueAccessorDirective implements ControlValueAccessor, OnChanges {
    /**
     * Public pour rester compatible avec le mécanisme
     * nativeElement utilisé par la librairie.
     */
    readonly _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

    private readonly renderer = inject(Renderer2);

    @Input() currency = 'EUR';
    @Input() locale = 'fr-FR';

    @Input()
    currencyDisplay: 'symbol' | 'narrowSymbol' | 'code' | 'name' = 'symbol';

    @Input() minimumFractionDigits?: number;
    @Input() maximumFractionDigits?: number;

    @Input() useGrouping = true;
    @Input() allowNegative = true;

    private currentValue: number | null = null;
    private focused = false;

    private onChange: (value: number | null) => void = () => {};

    private onTouched: () => void = () => {};

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.focused) {
            this.renderFormattedValue();
        }
    }

    writeValue(value: unknown): void {
        this.currentValue = this.normalizeModelValue(value);

        if (!this.focused) {
            this.renderFormattedValue();
        }
    }

    registerOnChange(callback: (value: number | null) => void): void {
        this.onChange = callback;
    }

    registerOnTouched(callback: () => void): void {
        this.onTouched = callback;
    }

    setDisabledState(disabled: boolean): void {
        this.renderer.setProperty(this._elementRef.nativeElement, 'disabled', disabled);
    }

    @HostListener('focus')
    handleFocus(): void {
        this.focused = true;

        this.setInputValue(this.formatEditableValue(this.currentValue));
    }

    @HostListener('input', ['$event'])
    handleInput(event: Event): void {
        const input = event.target as HTMLInputElement;

        const rawValue = input.value;

        if (rawValue.trim() === '') {
            this.currentValue = null;
            this.onChange(null);
            return;
        }

        const parsedValue = this.parseLocalizedNumber(rawValue);

        /*
         * Une saisie intermédiaire comme "-" ou ","
         * n'écrase pas encore le FormControl.
         */
        if (parsedValue === null) {
            return;
        }

        if (!this.allowNegative && parsedValue < 0) {
            return;
        }

        this.currentValue = parsedValue;
        this.onChange(parsedValue);
    }

    @HostListener('blur')
    handleBlur(): void {
        this.focused = false;

        this.renderFormattedValue();
        this.onTouched();
    }

    private normalizeModelValue(value: unknown): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numberValue = typeof value === 'number' ? value : Number(value);

        return Number.isFinite(numberValue) ? numberValue : null;
    }

    private renderFormattedValue(): void {
        this.setInputValue(this.formatCurrency(this.currentValue));
    }

    private setInputValue(value: string): void {
        this.renderer.setProperty(this._elementRef.nativeElement, 'value', value);
    }

    private formatCurrency(value: number | null): string {
        if (value === null) {
            return '';
        }

        const options = this.createCurrencyFormatOptions();

        return new Intl.NumberFormat(this.locale, options).format(value);
    }

    /**
     * Pendant l'édition, on retire le symbole et
     * les séparateurs de milliers.
     */
    private formatEditableValue(value: number | null): string {
        if (value === null) {
            return '';
        }

        return new Intl.NumberFormat(this.locale, {
            useGrouping: false,
            maximumFractionDigits: this.maximumFractionDigits ?? 20,
        }).format(value);
    }

    private createCurrencyFormatOptions(): Intl.NumberFormatOptions {
        const minimum = this.minimumFractionDigits;

        let maximum = this.maximumFractionDigits;

        if (minimum !== undefined && maximum !== undefined && maximum < minimum) {
            maximum = minimum;
        }

        return {
            style: 'currency',
            currency: this.currency,
            currencyDisplay: this.currencyDisplay,
            useGrouping: this.useGrouping,

            ...(minimum !== undefined
                ? {
                      minimumFractionDigits: minimum,
                  }
                : {}),

            ...(maximum !== undefined
                ? {
                      maximumFractionDigits: maximum,
                  }
                : {}),
        };
    }

    private parseLocalizedNumber(rawValue: string): number | null {
        const parts = new Intl.NumberFormat(this.locale).formatToParts(-12345.6);

        const groupSeparator = parts.find((part) => part.type === 'group')?.value;

        const decimalSeparator = parts.find((part) => part.type === 'decimal')?.value ?? '.';

        const minusSign = parts.find((part) => part.type === 'minusSign')?.value ?? '-';

        let normalized = this.normalizeLocalizedDigits(rawValue);

        if (groupSeparator) {
            normalized = normalized.split(groupSeparator).join('');
        }

        normalized = normalized.split(decimalSeparator).join('.');

        normalized = normalized.split(minusSign).join('-');

        /*
         * Retire les symboles monétaires,
         * espaces et codes de devise.
         */
        normalized = normalized.replace(/[^0-9+\-.]/g, '');

        if (normalized === '' || normalized === '-' || normalized === '+' || normalized === '.' || normalized === '-.' || normalized === '+.') {
            return null;
        }

        const parsed = Number(normalized);

        return Number.isFinite(parsed) ? parsed : null;
    }

    /**
     * Convertit également les chiffres localisés
     * vers 0-9.
     */
    private normalizeLocalizedDigits(value: string): string {
        const formatter = new Intl.NumberFormat(this.locale, {
            useGrouping: false,
        });

        let normalized = value;

        for (let digit = 0; digit <= 9; digit++) {
            const localizedDigit = formatter.formatToParts(digit).find((part) => part.type === 'integer')?.value;

            if (localizedDigit) {
                normalized = normalized.split(localizedDigit).join(String(digit));
            }
        }

        return normalized;
    }
}

@FieldMapper({
    type: EnumType.currency,
})
@Component({
    selector: 'kles-form-currency',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule, MatError, MatErrorMessageDirective, KlesCurrencyValueAccessorDirective],
    template: `
        <mat-form-field [formGroup]="group" [color]="color()" [subscriptSizing]="field.subscriptSizing" [appearance]="appearance()" class="form-element field-bottom">
            @if (label()) {
                <mat-label>
                    {{ label() }}
                </mat-label>
            }

            @if (icon()) {
                <mat-icon matPrefix>
                    {{ icon() }}
                </mat-icon>
            }

            <input
                matInput
                klesCurrency
                type="text"
                inputmode="decimal"
                autocomplete="off"
                [attr.id]="field.id"
                [attr.aria-valuemin]="min()"
                [attr.aria-valuemax]="max()"
                [ngClass]="ngClass()"
                [matTooltip]="tooltip()"
                [formControlName]="field.name"
                [placeholder]="placeholder()"
                [currency]="currencyOptions()?.code || defaultCurrencyCode"
                [locale]="currencyOptions()?.locale || localeId"
                [currencyDisplay]="currencyOptions()?.display || 'symbol'"
                [minimumFractionDigits]="currencyOptions()?.minimumFractionDigits"
                [maximumFractionDigits]="currencyOptions()?.maximumFractionDigits"
                [useGrouping]="currencyOptions()?.useGrouping !== false"
                [allowNegative]="currencyOptions()?.allowNegative !== false"
                (focus)="onFocus()"
                (blur)="onBlur()"
            />

            @if (hint()) {
                <mat-hint>
                    {{ hint() }}
                </mat-hint>
            }

            @if (field.subComponents || field.clearable || isPending()) {
                <div matSuffix class="suffix">
                    @if (isPending()) {
                        <mat-spinner mode="indeterminate" diameter="21" />
                    }

                    @if (field.subComponents || field.clearable) {
                        <ng-content />
                    }
                </div>
            }

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
    styleUrls: ['../styles/mat-suffix.style.scss', '../styles/mat-field-bottom.style.scss'],
})
export class KlesFormCurrencyComponent extends KlesFieldAbstract {
    readonly localeId = inject(LOCALE_ID);

    public readonly currencyOptions = computed(() => this.resolvedFieldUi()?.currencyOptions);

    readonly defaultCurrencyCode = inject(DEFAULT_CURRENCY_CODE);
}
