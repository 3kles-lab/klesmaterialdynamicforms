import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { KlesFormArray } from '../controls/array.control';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.array, factory: (field) => (new KlesFormArray(field).create()) })
@Component({
    selector: 'kles-array',
    template: `
    <div [formGroup]="group" class="container" [ngClass]="{'container-column': field.direction ==='column'}">
        <ng-container [formArrayName]="field.name">
            @for (subGroup of formArray.controls; track subGroup.value._id) {
                <div class="group-container" [ngClass]="field.direction === 'column' ? 'column': 'row'">
                    @for (subfield of field.collections; track subfield.name) {
                        @if (subfield.visible !== false) {
                            <ng-container klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
                            </ng-container>
                        }
                    }
                </div>
            }
        </ng-container>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:flex; flex-direction: inherit}',
        '.container { display: flex; flex-direction: inherit}',
        '.container-column {gap: 10px}',
        '.group-container {display:flex; flex-direction: inherit}',
        '.row { gap: 10px; flex-direction: row; align-items: baseline }',
        '.column { flex-direction: column; gap: 0px}'
    ]
})
export class KlesFormArrayComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    // subGroup: FormGroup

    formArray: UntypedFormArray;

    ngOnInit() {
        // this.subGroup = this.group.controls[this.field.name] as FormGroup;
        super.ngOnInit();
        this.formArray = this.group.controls[this.field.name] as UntypedFormArray;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
