import { KlesFieldAbstract } from './field.abstract';
import { Component } from '@angular/core';
import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';

@FieldMapper({ type: EnumType.file })
@Component({
    selector: 'kles-form-file',
    template: `
    <div [formGroup]="group">
        <kles-file-control
            [attr.id]="field.id"
            [formControlName]="field.name"
            [accept]="field.accept"
            [disabled]="field.disabled"
            [multiple]="field.multiple"
        ></kles-file-control>
    </div>
    `,
    styles: ['mat-form-field {width: calc(100%)}'],
    standalone: false
})
export class KlesFormFileComponent extends KlesFieldAbstract {
}
