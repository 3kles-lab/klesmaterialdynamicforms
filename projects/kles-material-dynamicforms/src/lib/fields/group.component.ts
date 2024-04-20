import { Component, HostBinding, OnDestroy, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { KlesFormGroup } from '../controls/group.control';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.group, factory: (field) => (new KlesFormGroup(field).create()) })
@Component({
    host: { '[formGroup]': 'group', '[formGroupName]': 'field.name' },
    selector: 'kles-group',
    template: `
        @for (subfield of field.collections; track subfield.name) {
            @if (subfield.visible !== false) {
                <ng-container klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
                </ng-container>
            }
        }
`,
    styles: [
        ' mat-form-field {width: calc(100%)}',
        ':host.group-container {display:flex; flex-direction: inherit; width: inherit;}',
        ':host.group-container-column { display: flex;flex-direction: column; }',
        ':host.group-container-column > * { width: 100%; }',
        ':host.group-container-row { display: inline-flex; flex-wrap:wrap; gap:10px; align-items: baseline;}',
        ':host.group-container-row > * { width: 100%; }',
        ':host.group-container-grid { display: grid; }',
        ':host.group-container-inline-grid { display: inline-grid; }',
    ],
})
export class KlesFormGroupComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    orientationClass: 'group-container'
        | 'group-container-column'
        | 'group-container-row'
        | 'group-container-grid'
        | 'group-container-inline-grid' = 'group-container';

    @HostBinding('class') get className() {
        return this.orientationClass;
    }

    subGroup: UntypedFormGroup;

    ngOnInit() {
        this.subGroup = this.group.controls[this.field.name] as UntypedFormGroup;
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
