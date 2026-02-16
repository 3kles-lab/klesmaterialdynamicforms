import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
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
                [label]="field.label"
                [color]="color()"
                [attribute]="field.attribute"
                [icon]="icon()"
                [iconSvg]="iconSvg()"
                [value]="field.value"
                [formControlName]="field.name"
                [tooltip]="field.tooltip"
                [type]="field.buttonType"
            >
            </kles-button>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, KlesButtonComponent, ReactiveFormsModule],
})
export class KlesFormButtonComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
