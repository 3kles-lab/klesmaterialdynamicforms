import { Component, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: "kles-form-chip",
    template: `
    <div [formGroup]="group">  
        <mat-chip-list>
            <mat-chip [color]="field.color" matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" selected>
                {{group.controls[field.name].value}}
            </mat-chip>
        </mat-chip-list>
    </div>
`,
    styles: []
})
export class KlesFormChipComponent extends KlesFieldAbstract implements OnInit {
    ngOnInit() { super.ngOnInit(); }
}