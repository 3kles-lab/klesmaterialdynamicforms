import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { KlesButtonFileComponent } from '../forms/buttonfile-control.component';

@Component({
    selector: 'kles-form-button-file',
    template: `
        <div [formGroup]="group">
            <kles-button-file
                [attr.id]="field.id"
                [classButton]="field.ngClass"
                [name]="field.name"
                [label]="field.label"
                [color]="field.color"
                [icon]="field.icon"
                [iconSvg]="field.iconSvg"
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
    imports: [CommonModule, ReactiveFormsModule, KlesButtonFileComponent],
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
