import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-fab',
    template: `
    <div [formGroup]="group">
        <kles-fab
            [attr.id]="field.id" [classButton]="field.ngClass" 
            [name]="field.name" [label]="field.label" [color]="field.color"
            [icon]="field.icon"
            [iconSvg]="field.iconSvg"
            [value]="field.value"
            [formControlName]="field.name"
            [tooltip]="field.tooltip"
            [type]="field.buttonType"
            >
        </kles-fab>
    </div>
    `,
    styles: []
})
export class KlesFormFabComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
