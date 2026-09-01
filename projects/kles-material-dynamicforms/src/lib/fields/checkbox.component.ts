import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';

@FieldMapper({ type: EnumType.checkbox })
@Component({
    selector: 'kles-form-checkbox',
    template: `
        <div [formGroup]="group">
            <mat-checkbox [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [indeterminate]="indeterminate()" (change)="onChange($event)" [color]="color()" [formControlName]="field.name">{{ label() }}</mat-checkbox>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCheckbox, MatTooltip],
})
export class KlesFormCheckboxComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onChange(e: MatCheckboxChange) {
        this.ui?.get(this.field.name)?.patchValue({ indeterminate: false });
    }
}
