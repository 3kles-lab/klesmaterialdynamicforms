
import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IFieldConfig } from '..';
import { FieldAbstract } from './field.abstract';


@Component({
    selector: "app-label",
    template: `
    <div [formGroup]="group" >
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" 
        [ngClass]="field.ngClass" 
        [ngStyle]="{'color':'inherit'}" [formControlName]="field.name" [placeholder]="field.placeholder | translate" [type]="field.inputType">
    </div>
`
})
export class LabelComponent extends FieldAbstract implements OnInit {

    ngOnInit() {
        this.group.controls[this.field.name].disable();
        super.ngOnInit();
    }
}