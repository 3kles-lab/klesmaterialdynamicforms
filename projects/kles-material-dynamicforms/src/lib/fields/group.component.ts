import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { KlesFormGroup } from '../controls/group.control';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

import { KlesDynamicFieldDirective } from '../directive/dynamic-field.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { GroupUiState } from '../ui/ui-state/group-ui-state';
import { KlesFormUiGroup } from '../ui/group.ui';

@FieldMapper({ type: EnumType.group, factory: (field) => new KlesFormGroup(field).create(), ui: (field) => new KlesFormUiGroup(field).create() })
@Component({
    // host: { '[formGroup]': 'group', '[formGroupName]': 'field.name' },
    selector: 'kles-group',
    template: `
        <ng-container [formGroup]="group">
            <ng-container [formGroupName]="field.name">
                @if (label()) {
                    <h4>
                        <span [matTooltip]="tooltip() ?? ''">{{ label() }}</span>
                    </h4>
                }

                @for (subfield of field.collections; track subfield.name) {
                    @if (subfield.visible !== false) {
                        <ng-container klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections" [ui]="subUi" [context]="context"> </ng-container>
                    }
                }
            </ng-container>
        </ng-container>
    `,
    styles: [
        ' mat-form-field {width: calc(100%)}',
        ':host.group-container {display:flex; flex-direction: inherit; width: inherit; justify-content:inherit; }',
        ':host.group-container-column { display: flex;flex-direction: column; justify-content:inherit; }',
        ':host.group-container-column > * { width: 100%; }',
        ':host.group-container-row { display: inline-flex; flex-wrap:wrap; gap:10px; align-items: baseline; justify-content:inherit; }',
        ':host.group-container-row.group-container-nowrap { flex-wrap: nowrap; }',
        ':host.group-container-row > * { width: 100%; }',
        ':host.group-container-grid { display: grid; }',
        ':host.group-container-inline-grid { display: inline-grid; }',
    ],
    standalone: true,
    imports: [KlesDynamicFieldDirective, MatTooltip, ReactiveFormsModule],
})
export class KlesFormGroupComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    orientationClass: 'group-container' | 'group-container-column' | 'group-container-row' | 'group-container-grid' | 'group-container-inline-grid' = 'group-container';

    @HostBinding('class') get className() {
        return this.orientationClass === 'group-container-row' && this.field.wrap === false ? `${this.orientationClass} group-container-nowrap` : this.orientationClass;
    }

    subGroup!: UntypedFormGroup;
    subUi!: GroupUiState;

    ngOnInit() {
        this.subGroup = this.group.controls[this.field.name] as UntypedFormGroup;
        this.subUi = this.ui?.get(this.field.name) as GroupUiState;
        super.ngOnInit();
        this.setOrientationClass();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    private setOrientationClass() {
        if (this.field.direction) {
            switch (this.field.direction) {
                case 'column':
                    this.orientationClass = 'group-container-column';
                    break;
                case 'row':
                    this.orientationClass = 'group-container-row';
                    break;
                case 'grid':
                    this.orientationClass = 'group-container-grid';
                    break;
                case 'inline-grid':
                    this.orientationClass = 'group-container-inline-grid';
                    break;
            }
        }
    }
}
