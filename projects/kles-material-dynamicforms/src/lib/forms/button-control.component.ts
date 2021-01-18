import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface IButtonChecker {
    busy: boolean;
    message?: string;
    event?: any;
}

@Component({
    selector: 'kles-button',
    template: `
        <span style="margin-right: 10px">
            <button mat-button [ngClass]="classButton" [color]="(color)?color:'primary'" [disabled]="disabled"
            (click)="click($event)">
                {{label | translate}}
                <mat-icon *ngIf="icon">{{icon}}</mat-icon>
                <mat-icon svgIcon="{{iconSvg}}" *ngIf="iconSvg"></mat-icon>
            </button>
        </span>
        <span style="text-align: center;" *ngIf="value.busy||false">
            <span style="text-align: center;margin-right: 10px">
                <mat-spinner [diameter]="25"></mat-spinner>
            </span>
            <span style="margin-right: 10px">
                {{value.message|translate}}...
            </span>
        </span>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesButtonComponent),
            multi: true
        }
    ]
})
export class KlesButtonComponent implements OnInit, ControlValueAccessor {
    @Input() name = '';
    @Input() label = '';
    @Input() color = 'accent';
    @Input() icon = '';
    @Input() iconSvg = '';
    @Input() disabled = false;
    @Input() classButton = '';
    @Input() value: IButtonChecker = {
        busy: true,
        message: '',
        event: false
    };

    onChange: any = () => { };
    onTouched: any = () => { };

    ngOnInit(): void {
        this.value = {
            busy: false,
            event: false
        };
    }

    click(event) {
        console.log('Click Value', this.value);
        this.value = {
            busy: false,
            event: this.name
        };
        console.log('Click Button=', this.value);
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