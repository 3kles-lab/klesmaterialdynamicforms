import { Component, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: 'kles-form-text',
    template: `
    <span matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass">
        {{group.controls[field.name].value}}
    </span> 
`
})
export class KlesFormTextComponent extends KlesFieldAbstract implements OnInit {

    ngOnInit() {
        super.ngOnInit();
    }
}
