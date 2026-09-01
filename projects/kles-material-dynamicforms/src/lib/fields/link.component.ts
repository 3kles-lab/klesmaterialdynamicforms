import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-link',
    template: `
        <a [href]="group.controls[field.name].value" [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()">
            {{ label() }}
        </a>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatTooltip, ReactiveFormsModule],
})
export class KlesFormLinkComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
