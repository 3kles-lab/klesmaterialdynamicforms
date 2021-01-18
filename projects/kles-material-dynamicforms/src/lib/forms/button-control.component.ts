import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface IButton {
    event?: any;
}

@Component({
    selector: 'kles-button',
    template: `
        <span>
            <button mat-button [ngClass]="classButton" [color]="(color)?color:'primary'" [disabled]="disabled"
            (click)="click($event)">
                {{label | translate}}
                <mat-icon *ngIf="icon">{{icon}}</mat-icon>
                <mat-icon svgIcon="{{iconSvg}}" *ngIf="iconSvg"></mat-icon>
            </button>
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
    @Input() value: IButton = {};

    onChange: any = () => { };
    onTouched: any = () => { };

    ngOnInit(): void {
    }

    click(event) {
        this.value.event = this.name;
        this.onChange(this.value);
    }

    writeValue(value: IButton): void {
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