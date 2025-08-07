import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { takeUntil } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';

@FieldMapper({ type: EnumType.checkbox })
@Component({
    selector: 'kles-form-checkbox',
    template: `
        <div [formGroup]="group">
            <mat-checkbox matTooltip="{{ field.tooltip }}" [attr.id]="field.id" [ngClass]="field.ngClass" [(indeterminate)]="field.indeterminate" [color]="field.color" [formControlName]="field.name">{{ field.label | translate }}</mat-checkbox>
        </div>
    `,
    styles: [],
    standalone: true,
    imports: [CommonModule, TranslateModule, ReactiveFormsModule, MatCheckbox, MatTooltip],
})
export class KlesFormCheckboxComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
