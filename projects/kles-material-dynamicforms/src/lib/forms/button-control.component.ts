import { Component, Input, OnInit, Signal, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { KlesButtonBase } from './button-control-base';
import { EnumButtonAttribute } from '../enums/button-attribute.enum';

/*From angular material 
    https://github.com/angular/components/blob/17.0.x/src/material/button/button-base.ts#L40C1-L56C5
 */
const HOST_SELECTOR_MDC_CLASS_PAIR: { attribute: string; mdcClasses: string[] }[] = [
    {
        attribute: EnumButtonAttribute['mat-button'],
        mdcClasses: ['mdc-button', 'mat-mdc-button'],
    },
    {
        attribute: EnumButtonAttribute['mat-flat-button'],
        mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
    },
    {
        attribute: EnumButtonAttribute['mat-raised-button'],
        mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
    },
    {
        attribute: EnumButtonAttribute['mat-stroked-button'],
        mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
    }
];


@Component({
    selector: 'kles-button',
    template: `
            <button mat-button [type]="type" [ngClass]="classButton || mdcClasses()" [color]="(color)?color:'primary'" [disabled]="disabled"
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
            useExisting: forwardRef(() => KlesButtonComponent),
            multi: true
        }
    ]
})
export class KlesButtonComponent extends KlesButtonBase implements OnInit {

    mdcClasses = signal(HOST_SELECTOR_MDC_CLASS_PAIR[0].mdcClasses);

    @Input() set attribute(attribute: EnumButtonAttribute) {
        this.mdcClasses.set(HOST_SELECTOR_MDC_CLASS_PAIR.find(selector => selector.attribute === attribute)?.mdcClasses || []);
    }
}