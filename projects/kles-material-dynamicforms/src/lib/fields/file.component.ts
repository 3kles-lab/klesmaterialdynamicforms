import { KlesFieldAbstract } from './field.abstract';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';
import { KlesFileControlComponent } from '../forms/file-control.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@FieldMapper({ type: EnumType.file })
@Component({
    selector: 'kles-form-file',
    template: `
        <div [formGroup]="group">
            <kles-file-control [attr.id]="field.id" [formControlName]="field.name" [accept]="field.accept" [disabled]="field.disabled" [multiple]="field.multiple"></kles-file-control>
        </div>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [KlesFileControlComponent, FormsModule, ReactiveFormsModule],
})
export class KlesFormFileComponent extends KlesFieldAbstract {}
