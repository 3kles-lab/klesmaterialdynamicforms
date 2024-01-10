import { OnInit, Input, Injectable, Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

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
}

@Component({
    template: ''
})
export abstract class KlesButtonBase implements OnInit, ControlValueAccessor {
    @Input() name = '';
    @Input() label = '';
    @Input() color = 'accent';
    @Input() icon = '';
    @Input() iconSvg = '';
    @Input() disabled = false;
    @Input('type') get type(): any {
        return this._type;
    }
    set type(value: any) {
        this._type = value || this._type;
    }
    @Input() classButton = '';
    @Input() value: IButton = {};
    @Input() tooltip?: string;

    protected _type = 'button';

    onChange: any = () => { };
    onTouched: any = () => { };

    ngOnInit(): void {
    }

    click(event) {
        if (!this.disabled && this.value && this._type === 'button') {
            this.value.event = this.name;
            this.onChange(this.value);
        }
    }

    writeValue(value: IButton): void {
        if (!value) {
            value = { event: this.name };
        }
        if (!value.event) {
            value.event = this.name;
        }
        if (value.uiButton) {
            const uiButton = value.uiButton;
            this.label = (uiButton.label) ? uiButton.label : this.label;
            this.color = (uiButton.color) ? uiButton.color : this.color;
            this.icon = (uiButton.icon) ? uiButton.icon : this.icon;
            this.iconSvg = (uiButton.iconSvg) ? uiButton.iconSvg : this.iconSvg;
            this.disabled = (uiButton.disabled) ? uiButton.disabled : this.disabled;
            this.classButton = (uiButton.class) ? uiButton.class : this.classButton;
            this.type = (uiButton.type) ? uiButton.type : 'submit';
        }
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}