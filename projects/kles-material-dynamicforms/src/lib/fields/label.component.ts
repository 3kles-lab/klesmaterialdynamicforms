
import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';


@Component({
    selector: "kles-form-label",
    template: `
    <div [formGroup]="group" >
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" 
        [ngClass]="field.ngClass" 
        [ngStyle]="{'color':'inherit'}" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType">
    </div>
`
})
export class KlesFormLabelComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit() {
        this.group.controls[this.field.name].disable();
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}