import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

import { ReactiveFormsModule } from '@angular/forms';
import { KlesButtonFileComponent } from '../forms/buttonfile-control.component';

@Component({
    selector: 'kles-form-button-file',
    template: `
        <div [formGroup]="group">
            <kles-button-file
                [attr.id]="field.id"
                [classButton]="ngClass()"
                [name]="field.name"
                [label]="field.label"
                [color]="color()"
                [icon]="icon()"
                [iconSvg]="iconSvg()"
                [value]="field.value"
                [formControlName]="field.name"
                [type]="field.buttonType"
                [accept]="field.accept"
                [disabled]="field.disabled"
            >
            </kles-button-file>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [ReactiveFormsModule, KlesButtonFileComponent],
})
export class KlesFormButtonFileComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
        this.field.buttonType = 'button';
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
