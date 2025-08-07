import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { FormControl, FormControlName, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'kles-form-slide-toggle',
    template: `
        <div [formGroup]="group">
            <mat-slide-toggle matTooltip="{{ field.tooltip }}" [attr.id]="field.id" [ngClass]="field.ngClass" [color]="field.color" [formControlName]="field.name">{{ field.label | translate }}</mat-slide-toggle>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, TranslateModule, MatSlideToggle, MatTooltip, ReactiveFormsModule],
})
export class KlesFormSlideToggleComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
