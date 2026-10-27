import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlesButtonBase } from './button-control-base';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';



@Component({
    selector: 'kles-fab',
    template: `
            <button matFab [extended]="!!effectiveLabel()" [type]="effectiveType()" [ngClass]="effectiveClassButton()" [color]="effectiveColor() || 'primary'" [disabled]="effectiveDisabled()" [attr.aria-busy]="effectiveLoading() ? 'true' : null"
            (click)="click($event)" [matTooltip]="tooltip()">
                {{ effectiveLabel() }}

                <!-- Each conditional has one icon root so Material can project it outside the label. -->
                @if (effectiveLoading()) {
                    <mat-icon aria-hidden="true"><mat-spinner [diameter]="18" /></mat-icon>
                }
                @if (!effectiveLoading() && effectiveIcon(); as icon) {
                    <mat-icon>{{ icon }}</mat-icon>
                }
                @if (!effectiveLoading() && effectiveIconSvg(); as iconSvg) {
                    <mat-icon [svgIcon]="iconSvg"></mat-icon>
                }
            </button>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesFabComponent),
            multi: true
        }
    ],
    standalone: true,
    imports: [MatProgressSpinner, CommonModule, MatIconModule, MatTooltipModule, MatButtonModule]
})
export class KlesFabComponent extends KlesButtonBase implements OnInit {

}
