import { KlesFieldAbstract } from './field.abstract';
import { OnInit, Component, OnDestroy } from '@angular/core';
import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';

@FieldMapper({ type: EnumType.button })
@Component({
    selector: 'kles-submit-button',
    template: `
    <div [formGroup]="group">
        <button matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" type="submit" [disabled]="field.disabled" mat-raised-button color="primary">{{field.label}}</button>
    </div>
    `,
    styles: []
})
export class KlesFormSubmitButtonComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit(): void {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
