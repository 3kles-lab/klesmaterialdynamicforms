import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlesButtonBase } from './button-control-base';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'kles-icon-button',
    template: `
        <button mat-icon-button [type]="type" [ngClass]="classButton" [color]="color ? color : 'primary'" [disabled]="disabled" (click)="click($event)" [matTooltip]="tooltip">
            @if (icon) {
            <mat-icon>{{ icon }}</mat-icon>
            } @if (iconSvg) {
            <mat-icon svgIcon="{{ iconSvg }}"></mat-icon>
            }
        </button>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesIconButtonComponent),
            multi: true,
        },
    ],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class KlesIconButtonComponent extends KlesButtonBase implements OnInit {}
