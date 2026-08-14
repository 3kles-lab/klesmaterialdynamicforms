import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { KlesTransformPipe } from '../pipe/transform.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

@FieldMapper({ type: EnumType.text })
@Component({
    selector: 'kles-form-text',
    template: `
        <span [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [ngStyle]="ngStyle()">
            {{ (field.property && group.controls[field.name].value ? group.controls[field.name].value[field.property] : group.controls[field.name].value) | klesTransform: field.pipeTransform }}
        </span>
        @if (field.subComponents || isPending()) {
            <ng-content></ng-content>
        }
    `,
    styles: [
        `
            :host {
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: inherit;
            }
        `,
    ],
    standalone: true,
    imports: [CommonModule, KlesTransformPipe, MatTooltip, ReactiveFormsModule],
})
export class KlesFormTextComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
