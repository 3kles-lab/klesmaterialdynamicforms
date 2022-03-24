import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-badge',
    template: `
    <span matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" 
        matBadge="{{group.controls[field.name].value}}" matBadgeOverlap="false" matBadgeColor="{{field.color}}">
    </span>
`
})
export class KlesFormBadgeComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
