import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { ReactiveFormsModule } from '@angular/forms';

import { KlesIconButtonComponent } from '../forms/icon-button-control.component';

@Component({
    selector: 'kles-form-icon-button',
    template: `
        <div [formGroup]="group">
            <kles-icon-button
                [attr.id]="field.id"
                [classButton]="ngClass()"
                [name]="field.name"
                [color]="color()"
                [icon]="icon()"
                [iconSvg]="iconSvg()"
                [value]="field.value"
                [formControlName]="field.name"
                [tooltip]="tooltip()"
                [type]="field.buttonType"
                (action)="triggerAction(field.name, $event)"
            >
            </kles-icon-button>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [ReactiveFormsModule, KlesIconButtonComponent],
})
export class KlesFormIconButtonComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
