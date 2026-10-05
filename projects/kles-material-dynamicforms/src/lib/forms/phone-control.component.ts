import { booleanAttribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, forwardRef, HostBinding, HostListener, inject, Input, LOCALE_ID, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroupDirective, NgControl, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { AsYouType, CountryCode, getCountries, getCountryCallingCode, getExampleNumber, parseIncompletePhoneNumber, parsePhoneNumberFromString, validatePhoneNumberLength } from 'libphonenumber-js/max';
import phoneExamples from 'libphonenumber-js/mobile/examples';

export interface IKlesPhoneOptions {
    defaultCountry?: CountryCode;
    /** Countries offered in the selector. International pasted numbers remain accepted. */
    countries?: readonly CountryCode[];
    locale?: string;
    countryLabel?: string;
    internationalLabel?: string;
    invalidMessage?: string;
}

/** Composite Material control. Valid values are E.164 strings; incomplete input is preserved. */
@Component({
    selector: 'kles-phone-control',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [MatSelectModule],
    providers: [{ provide: MatFormFieldControl, useExisting: forwardRef(() => KlesPhoneControlComponent) }],
    template: `
        <mat-select [value]="country" [disabled]="disabled" [aria-label]="options.countryLabel || 'Country calling code'"
            [aria-describedby]="describedBy" [panelWidth]="'auto'"
            (selectionChange)="selectCountry($event.value)" (openedChange)="onCountryPanelChange($event)">
            <mat-select-trigger>
                @if (country) { {{ country }} (+{{ callingCode }}) } @else { + }
            </mat-select-trigger>
            <mat-option value="">{{ options.internationalLabel || 'International' }} (+)</mat-option>
            @for (item of countryOptions; track item.code) {
                <mat-option [value]="item.code">{{ item.name }} (+{{ item.dialCode }})</mat-option>
            }
        </mat-select>
        <span class="separator" aria-hidden="true"></span>
        <input #phoneInput type="tel" inputmode="tel" autocomplete="tel" [value]="nationalNumber"
            [disabled]="disabled" [required]="required" [placeholder]="effectivePlaceholder"
            [attr.aria-label]="ariaLabel || placeholder || 'Phone number'" [attr.aria-describedby]="describedBy"
            [attr.aria-labelledby]="ariaLabel ? null : formField?.getLabelId()"
            [attr.aria-invalid]="errorState" (input)="editNumber($event)" (compositionend)="editNumber($event)" />
    `,
    styles: [`
        :host { display: flex; align-items: center; gap: 12px; width: 100%; }
        mat-select { flex: 1 1 0; min-width: 0; }
        .separator { flex: 0 0 1px; height: 24px; background: var(--mat-sys-outline-variant, #c4c7c5); }
        input { flex: 2 1 0; width: 0; min-width: 0; }
        input { font: inherit; color: inherit; background: transparent; border: 0; outline: none; padding: 4px 0; }
        :host(.kles-phone-disabled) { opacity: .6; }
    `],
})
export class KlesPhoneControlComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnInit, OnChanges, DoCheck, OnDestroy {
    private static nextId = 0;
    readonly ngControl = inject(NgControl, { optional: true, self: true });
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly changeDetector = inject(ChangeDetectorRef);
    private readonly matcher = inject(ErrorStateMatcher);
    private readonly parentForm = inject(FormGroupDirective, { optional: true });
    private readonly parentNgForm = inject(NgForm, { optional: true });
    private readonly locale = inject(LOCALE_ID);
    readonly formField = inject(MatFormField, { optional: true });
    @ViewChild('phoneInput') private phoneInput?: ElementRef<HTMLInputElement>;
    @ViewChild(MatSelect) private countrySelect?: MatSelect;
    @HostBinding() @Input() id = `kles-phone-${KlesPhoneControlComponent.nextId++}`;
    @Input() options: IKlesPhoneOptions = {};
    @Input() placeholder = '';
    @Input() ariaLabel = '';
    @Input() userAriaDescribedBy = '';
    private requiredInput = false;
    @Input({ transform: booleanAttribute }) get required(): boolean {
        return this.requiredInput || (this.ngControl?.control?.hasValidator(Validators.required) ?? false);
    }
    set required(value: boolean) { this.requiredInput = value; }
    @HostBinding('class.kles-phone-disabled') @Input({ transform: booleanAttribute }) disabled = false;
    readonly stateChanges = new Subject<void>();
    readonly controlType = 'kles-phone';
    readonly disableAutomaticLabeling = true;
    focused = false;
    errorState = false;
    describedBy = '';
    country: CountryCode | '' = 'FR';
    nationalNumber = '';
    countryOptions: { code: CountryCode; name: string; dialCode: string }[] = [];
    private currentValue: string | null = null;
    private lastRequired = false;
    private readonly examplePlaceholders = new Map<CountryCode, { national: string; international: string }>();
    private onChange: (value: string | null) => void = () => {};
    private onTouched: () => void = () => {};
    private readonly phoneValidator: ValidatorFn = (control) => {
        if (control.value == null || control.value === '') return null;
        const phone = this.parse(String(control.value));
        return phone?.isValid() && !phone.ext ? null : { phone: true };
    };

    constructor() {
        if (this.ngControl) this.ngControl.valueAccessor = this;
    }

    @Input() get value(): string | null { return this.currentValue; }
    set value(value: string | null) { this.writeValue(value); }
    get empty(): boolean { return this.nationalNumber.trim().length === 0; }
    get shouldLabelFloat(): boolean { return true; }
    get callingCode(): string { return this.country ? getCountryCallingCode(this.country) : ''; }
    get effectivePlaceholder(): string {
        if (this.placeholder) return this.placeholder;
        const code = this.country || this.defaultCountry() || 'FR';
        let example = this.examplePlaceholders.get(code);
        if (!example) {
            const phone = getExampleNumber(code, phoneExamples);
            example = { national: phone?.formatNational() ?? '', international: phone?.formatInternational() ?? '' };
            this.examplePlaceholders.set(code, example);
        }
        return this.country ? example.national : example.international;
    }

    ngOnInit(): void {
        if (!this.countryOptions.length) this.ngOnChanges();
        this.ngControl?.control?.addValidators(this.phoneValidator);
        this.ngControl?.control?.updateValueAndValidity({ emitEvent: false });
    }

    ngOnChanges(): void {
        const names = new Intl.DisplayNames(this.options.locale || this.locale, { type: 'region' });
        this.countryOptions = [...new Set(this.options.countries ?? getCountries())]
            .filter(code => getCountries().includes(code))
            .map(code => ({ code, name: names.of(code) || code, dialCode: getCountryCallingCode(code) }))
            .sort((a, b) => a.name.localeCompare(b.name, this.options.locale || this.locale));
        if (this.empty) this.country = this.defaultCountry();
        else if (this.country && !this.isOffered(this.country)) {
            const phone = this.parse(this.nationalNumber);
            if (phone) this.nationalNumber = phone.formatInternational();
            this.country = '';
        }
        this.notifyStateChange();
    }

    ngDoCheck(): void {
        const control = this.ngControl?.control as FormControl | null;
        const error = this.matcher.isErrorState(control, this.parentForm || this.parentNgForm);
        if (error !== this.errorState || this.lastRequired !== this.required) {
            this.errorState = error;
            this.lastRequired = this.required;
            this.notifyStateChange();
        }
    }

    writeValue(value: string | null): void {
        this.currentValue = value ?? null;
        this.country = this.defaultCountry();
        this.nationalNumber = value ?? '';
        if (value) {
            const phone = this.parse(value);
            if (phone) {
                this.country = phone.country && this.isOffered(phone.country) ? phone.country : '';
                this.nationalNumber = this.country ? phone.formatNational() : phone.formatInternational();
            }
        }
        this.notifyStateChange();
    }

    registerOnChange(callback: (value: string | null) => void): void { this.onChange = callback; }
    registerOnTouched(callback: () => void): void { this.onTouched = callback; }
    setDisabledState(disabled: boolean): void { this.disabled = disabled; this.notifyStateChange(); }
    setDescribedByIds(ids: string[]): void { this.describedBy = [...ids, this.userAriaDescribedBy].filter(Boolean).join(' '); }
    onContainerClick(event?: MouseEvent): void {
        if (event?.target && this.element.nativeElement.contains(event.target as Node)) return;
        if (!this.disabled) this.phoneInput?.nativeElement.focus();
    }

    @HostListener('focusin') handleFocus(): void { this.focused = true; this.notifyStateChange(); }
    @HostListener('focusout', ['$event']) handleBlur(event: FocusEvent): void {
        if (this.countrySelect?.panelOpen) return;
        if (event.relatedTarget && this.element.nativeElement.contains(event.relatedTarget as Node)) return;
        this.focused = false;
        const phone = this.parse(this.nationalNumber);
        if (phone?.isValid() && !phone.ext) this.nationalNumber = this.country ? phone.formatNational() : phone.formatInternational();
        this.onTouched();
        this.notifyStateChange();
    }

    editNumber(event: Event): void {
        if (this.disabled || (event as InputEvent).isComposing) return;
        const input = event.target as HTMLInputElement;
        const raw = input.value;
        const caret = input.selectionStart ?? raw.length;
        let number = this.editableDigits(raw);
        let digitsBeforeCaret = this.editableDigits(raw.slice(0, caret)).length;
        const previous = this.editableDigits(this.nationalNumber);
        const inputType = (event as InputEvent).inputType ?? '';
        // Deleting a formatting separator also deletes the adjacent digit.
        // Otherwise AsYouType would reinsert the separator and trap the cursor.
        if (number === previous && inputType.startsWith('delete')) {
            const index = inputType === 'deleteContentBackward' ? digitsBeforeCaret - 1 : digitsBeforeCaret;
            if (index >= 0 && index < number.length) {
                number = number.slice(0, index) + number.slice(index + 1);
                if (inputType === 'deleteContentBackward') digitsBeforeCaret--;
            }
        }
        const tooLong = number.replace(/\D/g, '').length > 15 ||
            validatePhoneNumberLength(number, this.country || undefined) === 'TOO_LONG';
        // Reject overlong insertions and extensions, rather than truncating a pasted number.
        if ((tooLong && number.length >= previous.length) || /(?:ext\.?|extension|[x#;])/i.test(raw)) {
            input.value = this.nationalNumber;
            input.setSelectionRange(Math.min(caret, input.value.length), Math.min(caret, input.value.length));
            return;
        }
        this.nationalNumber = new AsYouType(this.country || undefined).input(number);
        const phone = this.parse(this.nationalNumber);
        if (/^\s*(\+|00)/.test(this.nationalNumber) && phone) {
            this.country = phone.country && this.isOffered(phone.country) ? phone.country : '';
        }
        // Update the DOM even if filtering produces the same value as the previous render.
        input.value = this.nationalNumber;
        const nextCaret = caret === raw.length ? input.value.length : this.formattedCaret(input.value, digitsBeforeCaret);
        input.setSelectionRange(nextCaret, nextCaret);
        this.emitValue();
    }

    selectCountry(nextCountry: CountryCode | ''): void {
        if (nextCountry === this.country) return;
        this.country = nextCountry;
        this.nationalNumber = '';
        this.emitValue();
    }

    onCountryPanelChange(opened: boolean): void {
        this.focused = opened || this.element.nativeElement.contains(this.element.nativeElement.ownerDocument.activeElement);
        if (!this.focused) this.onTouched();
        this.notifyStateChange();
    }

    get countryPanelOpen(): boolean { return this.countrySelect?.panelOpen ?? false; }

    private editableDigits(value: string): string {
        return parseIncompletePhoneNumber(value).replace(/^00/, '+');
    }

    private formattedCaret(value: string, significantCharacters: number): number {
        if (significantCharacters <= 0) return 0;
        for (let index = 0, count = 0; index < value.length; index++) {
            if (/[\d+]/.test(value[index]) && ++count === significantCharacters) return index + 1;
        }
        return value.length;
    }

    private emitValue(): void {
        const phone = this.parse(this.nationalNumber);
        this.currentValue = this.nationalNumber.trim() === '' ? null : phone?.isValid() && !phone.ext ? phone.number : this.nationalNumber;
        this.onChange(this.currentValue);
        this.notifyStateChange();
    }

    private parse(value: string) {
        const normalized = value.trim().replace(/^00/, '+');
        return parsePhoneNumberFromString(normalized, { defaultCountry: this.country || undefined, extract: false });
    }
    private notifyStateChange(): void {
        this.changeDetector.markForCheck();
        this.stateChanges.next();
    }
    private isOffered(code: CountryCode): boolean { return !this.options.countries || this.options.countries.includes(code); }
    private defaultCountry(): CountryCode | '' {
        const code = this.options.defaultCountry ?? 'FR';
        return getCountries().includes(code) && this.isOffered(code) ? code : this.countryOptions[0]?.code ?? '';
    }
    ngOnDestroy(): void {
        this.ngControl?.control?.removeValidators(this.phoneValidator);
        this.ngControl?.control?.updateValueAndValidity({ emitEvent: false });
        this.stateChanges.complete();
    }
}
