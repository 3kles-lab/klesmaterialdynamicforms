import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component } from '@angular/core';


@Component({
    selector: 'kles-form-button',
    template: `
    <div [formGroup]="group">
        <button matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" type="submit" [disabled]="field.disabled" mat-raised-button color="primary">{{field.label}}</button>
    </div>
    `,
    styles: []
})
export class KlesFormSubmitButtonComponent extends KlesFieldAbstract implements OnInit {

    ngOnInit(): void {
        super.ngOnInit();
    }
}
