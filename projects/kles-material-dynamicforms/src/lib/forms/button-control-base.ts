import { Component, computed, EventEmitter, input, OnInit, Output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { MatButtonAppearance } from '@angular/material/button';

export interface IButton {
    event?: any;
    uiButton?: IUIButton;
}

export interface IUIButton {
    label?: string;
    color?: string;
    icon?: string;
    iconSvg?: string;
    disabled?: boolean;
    class?: string;
    type?: string;
    accept?: string;
    buttonAppearance?: MatButtonAppearance;
}

@Component({
    template: '',
    standalone: true,
})
export abstract class KlesButtonBase<TButton extends IButton = IButton> implements OnInit, ControlValueAccessor {
    readonly name = input('');
    readonly label = input('');
    readonly color = input('accent');
    readonly icon = input('');
    readonly iconSvg = input('');
    readonly disabled = input(false);
    readonly type = input<string | undefined>('button');
    readonly classButton = input('');
    readonly value = input<TButton>({} as TButton);
    readonly tooltip = input<string>();
    readonly buttonAppearance = input<MatButtonAppearance>('text');

    protected readonly uiButtonState = signal<IUIButton | undefined>(undefined);
    private readonly formDisabledState = signal<boolean | undefined>(undefined);
    private readonly writtenValueState = signal<TButton | undefined>(undefined, { equal: () => false });

    readonly effectiveLabel = computed(() => this.uiButtonState()?.label ?? this.label());
    readonly effectiveColor = computed(() => this.uiButtonState()?.color ?? this.color());
    readonly effectiveIcon = computed(() => this.uiButtonState()?.icon ?? this.icon());
    readonly effectiveIconSvg = computed(() => this.uiButtonState()?.iconSvg ?? this.iconSvg());
    readonly effectiveDisabled = computed(() => this.formDisabledState() ?? this.uiButtonState()?.disabled ?? this.disabled());
    readonly effectiveType = computed(() => this.uiButtonState()?.type ?? (this.uiButtonState() ? 'submit' : this.type() || 'button'));
    readonly effectiveClassButton = computed(() => this.uiButtonState()?.class ?? this.classButton());
    readonly effectiveButtonAppearance = computed(() => this.uiButtonState()?.buttonAppearance ?? this.buttonAppearance());
    readonly effectiveValue = computed(() => this.writtenValueState() ?? this.value());

    @Output() action = new EventEmitter<MouseEvent>();

    onChange: any = () => {};
    onTouched: any = () => {};

    ngOnInit(): void {}

    click(event: MouseEvent) {
        if (this.effectiveDisabled() || this.effectiveType() !== 'button') {
            return;
        }

        const value = this.effectiveValue();
        if (value) {
            value.event = this.name();
            this.writtenValueState.set(value);
            this.onChange(value);
        }

        this.action.emit(event);
    }

    writeValue(value: TButton): void {
        if (!value) {
            value = { event: this.name() } as TButton;
        }
        if (!value.event) {
            value.event = this.name();
        }
        this.uiButtonState.set(value.uiButton);
        this.writtenValueState.set(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.formDisabledState.set(isDisabled);
    }
}
