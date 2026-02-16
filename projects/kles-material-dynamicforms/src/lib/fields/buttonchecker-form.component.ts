import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { KlesButtonCheckerComponent } from '../forms/buttonchecker-control.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-button-checker',
    template: `
    <div [formGroup]="group">
        <kles-button-checker
            [attr.id]="field.id" [classButton]="ngClass()"
            [name]="field.name" [label]="field.label" [color]="color()"
            [icon]="icon()"
            [iconSvg]="iconSvg()"
            [value]="field.value"
            [formControlName]="field.name"
            [tooltip]="field.tooltip"
            [disabled]="field.disabled"
            >
        </kles-button-checker>
    </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, KlesButtonCheckerComponent, ReactiveFormsModule],
})
export class KlesFormButtonCheckerComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
