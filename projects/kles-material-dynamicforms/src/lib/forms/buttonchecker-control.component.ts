import { Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlesButtonComponent } from './button-control.component';

interface IButtonChecker {
    busy: boolean;
    counter: number;
    error?: any;
    event?: any;
}

@Component({
    selector: 'kles-button-checker',
    template: `
        <span *ngIf="value.error && !value.busy" style="margin-right: 10px">
            <kles-button [classButton]="classButton" 
            [name]="name" [label]="label" [color]="color" 
            [icon]="icon"
            [iconSvg]="iconSvg"
            [value]="value" matBadge="{{value.counter}}">
        </kles-button>

        </span>
        <span style="text-align: center;" *ngIf="value.busy||false">
            <span style="text-align: center;margin-right: 10px">
                <mat-spinner [diameter]="25"></mat-spinner>
            </span>
            <span style="margin-right: 10px">
                {{'line.check'|translate}}...
            </span>
        </span>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesButtonCheckerComponent),
            multi: true
        }
    ]
})
export class KlesButtonCheckerComponent extends KlesButtonComponent implements OnInit, ControlValueAccessor {
    value: IButtonChecker = {
        busy: true,
        counter: 0,
        event: false
    };

    onChange: any = () => { };
    onTouched: any = () => { };

    ngOnInit(): void {
        this.name = 'Test';
    }

    click(event) {
        this.value.event = true;
        console.log('Click Button Checker=', this.value);
        this.onChange(this.value);
    }

    writeValue(value: IButtonChecker): void {
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