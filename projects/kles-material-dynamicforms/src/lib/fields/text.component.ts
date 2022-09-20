import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.text })
@Component({
    selector: 'kles-form-text',
    template: `
    <span matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass">
        {{((field.property && group.controls[field.name].value) ? group.controls[field.name].value[field.property] : group.controls[field.name].value) | klesTransform:field.pipeTransform}}
    </span>
`
})
export class KlesFormTextComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
