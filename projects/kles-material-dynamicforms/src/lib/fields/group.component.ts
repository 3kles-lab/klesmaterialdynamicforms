import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KlesFieldAbstract } from './field.abstract';
@Component({
    selector: 'kles-group',
    template: `
    <div [formGroup]="group">
        <div [formGroupName]="field.name">
            <ng-container *ngFor="let subfield of field.collections;" class="dynamic-form-row-item" klesDynamicField [field]="subfield" [group]="subGroup">
            </ng-container>
        </div>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:inherit; flex-direction: inherit}'
    ]
})
export class KlesFormGroupComponent extends KlesFieldAbstract implements OnInit {

    subGroup: FormGroup

    ngOnInit() {
        this.subGroup = this.group.controls[this.field.name] as FormGroup;
        super.ngOnInit();
    }
}
