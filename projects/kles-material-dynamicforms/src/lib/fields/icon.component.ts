import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'kles-form-icon',
    template: `
        <mat-icon [color]="color()" [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [ngStyle]="ngStyle()">
            {{ group.controls[field.name].value }}
        </mat-icon>
    `,
    styles: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatIcon, MatTooltip, ReactiveFormsModule],
})
export class KlesFormIconComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
