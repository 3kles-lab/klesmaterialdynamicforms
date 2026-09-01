import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { KlesButtonBase } from './button-control-base';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'kles-button',
    template: `
            <button [matButton]="effectiveButtonAppearance()" [type]="effectiveType()" [ngClass]="effectiveClassButton()" [color]="effectiveColor() || 'primary'" [disabled]="effectiveDisabled()"
            (click)="click($event)" [matTooltip]="tooltip()">
                {{ effectiveLabel() }}

                @if (effectiveIcon(); as icon) {
                    <mat-icon>{{ icon }}</mat-icon>
                }

                @if (effectiveIconSvg(); as iconSvg) {
                    <mat-icon [svgIcon]="iconSvg"></mat-icon>
                }
            </button>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesButtonComponent),
            multi: true
        }
    ],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIcon, MatTooltip, MatButton]
})
export class KlesButtonComponent extends KlesButtonBase implements OnInit {
}
