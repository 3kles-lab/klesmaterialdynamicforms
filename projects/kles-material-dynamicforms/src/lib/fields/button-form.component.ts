import { OnInit, Component } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';


@Component({
    selector: 'kles-form-button',
    template: `
    <div [formGroup]="group">
        <kles-button 
            [attr.id]="field.id" [classButton]="field.ngClass" 
            [name]="field.name" [label]="field.label" [color]="field.color" 
            [icon]="field.icon"
            [iconSvg]="field.iconSvg"
            [value]="field.value"
            [formControlName]="field.name">
        </kles-button>
    </div>
    `,
    styles: []
})
export class KlesFormButtonComponent extends KlesFieldAbstract implements OnInit {

    ngOnInit(): void {
        super.ngOnInit();
    }
}
