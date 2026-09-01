import { Component, OnDestroy, OnInit, viewChild } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { KlesFocusTargetDirective } from '../directive/focus-target.directive';

@Component({
    selector: 'kles-form-slide-toggle',
    template: `
        <div [formGroup]="group">
            <mat-slide-toggle klesFocusTarget [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [color]="color()" [formControlName]="field.name">{{ label() }}</mat-slide-toggle>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, MatSlideToggle, MatTooltip, ReactiveFormsModule, KlesFocusTargetDirective],
})
export class KlesFormSlideToggleComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    private readonly slideToggle = viewChild(MatSlideToggle);

    protected override focus(): void {
        this.slideToggle()?.focus();
    }

    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
