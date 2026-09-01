import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IButton, KlesButtonBase } from './button-control-base';

import { KlesButtonComponent } from './button-control.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatBadge } from '@angular/material/badge';

export interface IButtonChecker extends IButton {
    busy: boolean;
    error?: any[];
    message?: string;
}

@Component({
    selector: 'kles-button-checker',
    template: `
        @if (effectiveValue().error && !effectiveValue().busy) {
        <span>
            <kles-button
                [classButton]="effectiveClassButton()"
                [name]="name()"
                [label]="effectiveLabel()"
                [color]="effectiveColor()"
                [icon]="effectiveIcon()"
                [iconSvg]="effectiveIconSvg()"
                [value]="effectiveValue()"
                [tooltip]="tooltip()"
                [disabled]="effectiveDisabled()"
                [matBadge]="countError()"
                (click)="click($event)">
            </kles-button>
        </span>
        }
        <span style="text-align: center;">
            @if (effectiveValue().busy) {
            <span style="text-align: center;margin-right: 10px">
                <mat-spinner [diameter]="25"></mat-spinner>
            </span>
            } @if (effectiveValue().message; as message) {
            <span style="margin-right: 10px">
                {{ message }}
            </span>
            }
        </span>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesButtonCheckerComponent),
            multi: true,
        },
    ],
    standalone: true,
    imports: [ReactiveFormsModule, KlesButtonComponent, MatProgressSpinner, MatBadge],
})
export class KlesButtonCheckerComponent extends KlesButtonBase<IButtonChecker> implements ControlValueAccessor {
    countError(): number {
        return this.effectiveValue().error?.length ?? 0;
    }
}
