import { OnInit, Component } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-button-file',
    template: `
    <div [formGroup]="group">
        <kles-button-file
            [attr.id]="field.id" [classButton]="field.ngClass" 
            [name]="field.name" [label]="field.label" [color]="field.color" 
            [icon]="field.icon"
            [iconSvg]="field.iconSvg"
            [value]="field.value"
            [formControlName]="field.name">
        </kles-button-file>
    </div>
    `,
    styles: []
})
export class KlesFormButtonFileComponent extends KlesFieldAbstract implements OnInit {

    ngOnInit(): void {
        super.ngOnInit();
    }
}
