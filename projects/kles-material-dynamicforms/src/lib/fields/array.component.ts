import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { KlesFieldAbstract } from './field.abstract';
@Component({
    selector: 'kles-array',
    template: `
    <div [formGroup]="group">
        <ng-container [formArrayName]="field.name">
            <div class="group-container" *ngFor="let subGroup of formArray.controls let index = index;"
            [ngClass]="field.direction === 'column' ? 'column': 'row'">
                <ng-container *ngFor="let subfield of field.collections;"
                    klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
                </ng-container>
            </div>
        </ng-container>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:flex; flex-direction: inherit}',
        '.group-container {display:flex; flex-direction: inherit}',
        '.row { gap:10px; flex-direction: row }',
        '.column { flex-direction: column, gap:0px}'
    ]
})
export class KlesFormArrayComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    // subGroup: FormGroup

    formArray: FormArray;

    ngOnInit() {
        // this.subGroup = this.group.controls[this.field.name] as FormGroup;
        super.ngOnInit();
        this.formArray = this.group.controls[this.field.name] as FormArray;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
