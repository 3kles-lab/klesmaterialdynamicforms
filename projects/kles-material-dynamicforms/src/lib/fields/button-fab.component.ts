import { OnInit, Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { KlesFabComponent } from '../forms/fab-control.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-fab',
    template: `
        <div [formGroup]="group">
            <kles-fab
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
                (action)="triggerAction(field.name, $event)"
            >
            </kles-fab>
        </div>
    `,
    styles: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconModule, MatTooltipModule, MatButtonModule, KlesFabComponent, ReactiveFormsModule],
})
export class KlesFormFabComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
