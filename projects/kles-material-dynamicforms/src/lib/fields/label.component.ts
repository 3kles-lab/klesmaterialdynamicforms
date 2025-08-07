
import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatTooltip } from "@angular/material/tooltip";


@Component({
    selector: "kles-form-label",
    template: `
    <div [formGroup]="group" >
        <input matInput matTooltip="{{field.tooltip}}" [attr.id]="field.id" 
        [ngClass]="field.ngClass" 
        [ngStyle]="{'color':'inherit'}" [formControlName]="field.name" [placeholder]="field.placeholder" [type]="field.inputType">
    </div>
`,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatTooltip]
})
export class KlesFormLabelComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    ngOnInit() {
        this.group.controls[this.field.name].disable({ emitEvent: false });
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}