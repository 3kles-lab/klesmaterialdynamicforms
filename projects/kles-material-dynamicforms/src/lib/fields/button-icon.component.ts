import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-icon-button',
    template: `
    <div [formGroup]="group">
        <kles-icon-button
            [attr.id]="field.id" [classButton]="field.ngClass" 
            [name]="field.name" [color]="field.color" 
            [icon]="field.icon"
            [iconSvg]="field.iconSvg"
            [value]="field.value"
            [formControlName]="field.name"
            [tooltip]="field.tooltip"
            [type]="field.buttonType"
            >
        </kles-icon-button>
    </div>
    `,
    styles: []
})
export class KlesFormIconButtonComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
