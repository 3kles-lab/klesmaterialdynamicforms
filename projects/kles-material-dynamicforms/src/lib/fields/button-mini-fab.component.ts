import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { KlesMiniFabComponent } from '../forms/mini-fab-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-mini-fab',
    template: `
    <div [formGroup]="group">
        <kles-mini-fab
            [attr.id]="field.id" [classButton]="field.ngClass" 
            [name]="field.name" [label]="field.label" [color]="field.color" 
            [icon]="field.icon"
            [iconSvg]="field.iconSvg"
            [value]="field.value"
            [formControlName]="field.name"
            [tooltip]="field.tooltip"
            [type]="field.buttonType"
            >
        </kles-mini-fab>
    </div>
    `,
    styles: [],
    standalone: true,
    imports: [KlesMiniFabComponent, CommonModule, ReactiveFormsModule]
})
export class KlesFormMiniFabComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
