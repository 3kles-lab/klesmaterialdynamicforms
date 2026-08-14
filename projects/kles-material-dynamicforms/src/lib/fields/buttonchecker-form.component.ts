import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

import { KlesButtonCheckerComponent } from '../forms/buttonchecker-control.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-button-checker',
    template: `
        <div [formGroup]="group">
            <kles-button-checker
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
                [disabled]="field.disabled"
                (action)="triggerAction(field.name, $event)"
            >
            </kles-button-checker>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [KlesButtonCheckerComponent, ReactiveFormsModule],
})
export class KlesFormButtonCheckerComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
