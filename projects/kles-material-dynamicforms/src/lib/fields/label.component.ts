import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'kles-form-label',
    template: `
        <div [formGroup]="group">
            <input matInput matTooltip="{{ field.tooltip }}" [attr.id]="field.id" [ngClass]="ngClass()" [ngStyle]="{ color: 'inherit' }" [formControlName]="field.name" [placeholder]="field.placeholder" [type]="inputType()" />
        </div>
    `,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatTooltip, MatInputModule],
})
export class KlesFormLabelComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    constructor() {
        super();
        this.group.controls[this.field.name].disable({ emitEvent: false });
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
