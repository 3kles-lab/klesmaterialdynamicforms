import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'kles-form-slide-toggle',
    template: `
        <div [formGroup]="group">
            <mat-slide-toggle [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [color]="color()" [formControlName]="field.name">{{ label() }}</mat-slide-toggle>
        </div>
    `,
    styles: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatSlideToggle, MatTooltip, ReactiveFormsModule],
})
export class KlesFormSlideToggleComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
