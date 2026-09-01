import { OnInit, Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

import { KlesButtonComponent } from '../forms/button-control.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-button',
    template: `
        <div [formGroup]="group">
            <kles-button
                [attr.id]="field.id"
                [classButton]="ngClass()"
                [name]="field.name"
                [label]="label()"
                [color]="color()"
                [icon]="icon()"
                [iconSvg]="iconSvg()"
                [value]="field.value"
                [formControlName]="field.name"
                [tooltip]="tooltip()"
                [type]="field.buttonType"
                [buttonAppearance]="buttonAppearance()"
                (action)="triggerAction(field.name, $event)"
            >
            </kles-button>
        </div>
    `,
    styles: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [KlesButtonComponent, ReactiveFormsModule],
})
export class KlesFormButtonComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
