import { FieldAbstract } from './field.abstract';
import { OnInit, Component } from '@angular/core';


@Component({
    selector: 'app-button',
    template: `
    <div [formGroup]="group">
        <button matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" type="submit" [disabled]="field.disabled" mat-raised-button color="primary">{{field.label}}</button>
    </div>
    `,
    styles: []
})
export class ButtonComponent extends FieldAbstract implements OnInit {

    ngOnInit(): void {
        super.ngOnInit();
    }
}
