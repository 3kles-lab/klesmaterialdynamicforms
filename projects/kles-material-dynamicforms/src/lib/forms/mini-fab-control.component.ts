import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlesButtonBase } from './button-control-base';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';



@Component({
    selector: 'kles-mini-fab',
    template: `
            <button matMiniFab [type]="effectiveType()" [ngClass]="effectiveClassButton()" [color]="effectiveColor() || 'primary'" [disabled]="effectiveDisabled()" [attr.aria-busy]="effectiveLoading() ? 'true' : null"
            (click)="click($event)" [matTooltip]="tooltip()">
                {{ effectiveLabel() }}

                @if (effectiveLoading()) {
                    <mat-icon aria-hidden="true"><mat-spinner [diameter]="18" /></mat-icon>
                } @else {
                    @if (effectiveIcon(); as icon) {
                        <mat-icon>{{ icon }}</mat-icon>
                    }
                    @if (effectiveIconSvg(); as iconSvg) {
                        <mat-icon [svgIcon]="iconSvg"></mat-icon>
                    }
                }
            </button>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesMiniFabComponent),
            multi: true
        }
    ],
    standalone: true,
    imports: [MatProgressSpinner, CommonModule, MatIconModule, MatTooltipModule, MatButtonModule]
})
export class KlesMiniFabComponent extends KlesButtonBase implements OnInit {

}
