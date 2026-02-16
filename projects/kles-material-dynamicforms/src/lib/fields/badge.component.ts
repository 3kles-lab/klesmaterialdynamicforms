import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@FieldMapper({ type: EnumType.badge })
@Component({
    selector: 'kles-form-badge',
    template: `
    <span matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="ngClass()" 
        matBadge="{{group.controls[field.name].value}}" matBadgeOverlap="false" [matBadgeColor]="color()">
    </span>
`,
    standalone: true,
    
    imports: [CommonModule, MatTooltipModule, MatBadgeModule],
})
export class KlesFormBadgeComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
