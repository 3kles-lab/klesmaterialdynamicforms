import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KlesFieldAbstract } from './field.abstract';
@Component({
    selector: 'kles-group',
    template: `
    <div [formGroup]="group" class="group-container">
        <div [formGroupName]="field.name" class="group-container" [style.flex-direction]="field.direction || 'inherit'" [ngClass]="field.ngClass" >
            <ng-container *ngFor="let subfield of field.collections;" klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
            </ng-container>
        </div>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:flex; flex-direction: inherit}',
        '.group-container {display:flex; flex-direction: inherit}'
    ]
})
export class KlesFormGroupComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    subGroup: FormGroup;

    ngOnInit() {
        this.subGroup = this.group.controls[this.field.name] as FormGroup;
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
