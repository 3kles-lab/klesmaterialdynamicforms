import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlesButtonBase } from './button-control-base';



@Component({
    selector: 'kles-fab',
    template: `
            <button mat-fab [extended]="!!label" [type]="type" [ngClass]="classButton" [color]="(color)?color:'primary'" [disabled]="disabled"
            (click)="click($event)" [matTooltip]="tooltip">
                {{label | translate}}

                @if (icon) {
                    <mat-icon>{{icon}}</mat-icon>
                }

                @if (iconSvg) {
                    <mat-icon svgIcon="{{iconSvg}}"></mat-icon>
                }
            </button>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesFabComponent),
            multi: true
        }
    ]
})
export class KlesFabComponent extends KlesButtonBase implements OnInit {

}