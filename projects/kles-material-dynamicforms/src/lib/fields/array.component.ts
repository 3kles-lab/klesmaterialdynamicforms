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
    <div [formGroup]="group">
        <ng-container [formArrayName]="field.name">
            <div class="group-container" *ngFor="let subGroup of formArray.controls let index = index;"
            [ngClass]="field.direction === 'column' ? 'column': 'row'">
                <ng-container *ngFor="let subfield of field.collections;">
                    <ng-container *ngIf="subfield.visible !== false"
                        klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
                    </ng-container>
                </ng-container>
            </div>
        </ng-container>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:flex; flex-direction: inherit}',
        '.group-container {display:flex; flex-direction: inherit}',
        '.row { gap: 10px; flex-direction: row }',
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
