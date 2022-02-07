import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { KlesFieldAbstract } from './field.abstract';
@Component({
    selector: 'kles-array',
    template: `
    <div [formGroup]="group" class="group-container">
        <ng-container [formArrayName]="field.name">
            <div class="group-container" *ngFor="let subGroup of formArray.controls let index = index;" [style.flex-direction]="field.direction || 'row'"
            [ngClass]="field.ngClass" [ngStyle]="field.ngStyle">
                <ng-container *ngFor="let subfield of field.collections;"
                    klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
                </ng-container>
            </div>
        </ng-container>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:flex; flex-direction: inherit}',
        '.group-container {display:flex; flex-direction: inherit}'
    ]
})
export class KlesFormArrayComponent extends KlesFieldAbstract implements OnInit {

    // subGroup: FormGroup

    formArray: FormArray;

    ngOnInit() {
        // this.subGroup = this.group.controls[this.field.name] as FormGroup;
        super.ngOnInit();
        this.formArray = this.group.controls[this.field.name] as FormArray;
        console.log('on arrive ici')
        console.log(this.field)
        console.log(this.formArray)
    }
}
