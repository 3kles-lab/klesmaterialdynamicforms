import { Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IButton, KlesButtonComponent } from './button-control.component';

export interface IButtonChecker extends IButton {
    busy: boolean;
    error?: any[];
    message?: string;
}

@Component({
    selector: 'kles-button-checker',
    template: `
        <span *ngIf="value.error && !value.busy">
            <kles-button 
                [classButton]="classButton" 
                [name]="name" [label]="label" [color]="color" 
                [icon]="icon" [iconSvg]="iconSvg"
                [value]="value" 
                [tooltip]="tooltip"
                matBadge="{{countError()}}" (click)="click($event)">
            </kles-button>
        </span>
        <span style="text-align: center;" *ngIf="value.busy||false">
            <span style="text-align: center;margin-right: 10px">
                <mat-spinner [diameter]="25"></mat-spinner>
            </span>
            <span *ngIf="value.message" style="margin-right: 10px">
                {{value.message|translate}}...
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
export class KlesButtonCheckerComponent extends KlesButtonComponent implements ControlValueAccessor {
    value: IButtonChecker = {
        busy: false,
        error: [],
        event: false
    };

    countError(): number {
        return (this.value.error) ? this.value.error.length : 0;
    }
}