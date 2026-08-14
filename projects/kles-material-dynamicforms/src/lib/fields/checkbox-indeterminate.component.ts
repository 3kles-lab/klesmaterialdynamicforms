import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { KlesIndeterminateCheckboxComponent } from '../forms/indeterminate-checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@FieldMapper({ type: EnumType.checkbox })
@Component({
    selector: 'kles-form-checkbox-indeterminate',
    template: `
        <div [formGroup]="group">
            <kles-checkbox-indeterminate [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [color]="color()" [formControlName]="field.name">{{
                label()
            }}</kles-checkbox-indeterminate>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, KlesIndeterminateCheckboxComponent, MatTooltipModule],
})
export class KlesFormCheckboxIndeterminateComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
