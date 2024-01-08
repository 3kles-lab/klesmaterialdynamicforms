import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({
    type: EnumType.lineBreak,
    factory: () => null
})
@Component({
    selector: 'kles-form-line-break',
    template: ``,
    styles: [
        `:host{
                     flex-basis: 100%;
                     display: flex;
                     height:0;
                 }`
    ]
})
export class KlesFormLineBreakComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
