import { OnInit, Component } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-button-checker',
    template: `
    <div [formGroup]="group">
        <kles-button-checker
            [attr.id]="field.id" [classButton]="field.ngClass" 
            [name]="field.name" [label]="field.label" [color]="field.color" 
            [icon]="field.icon"
            [iconSvg]="field.iconSvg"
            [value]="field.value"
            [formControlName]="field.name"
            [tooltip]="field.tooltip">
        </kles-button-checker>
    </div>
    `,
    styles: []
})
export class KlesFormButtonCheckerComponent extends KlesFieldAbstract implements OnInit {

    ngOnInit(): void {
        super.ngOnInit();
    }
}
