import { Component, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: 'kles-form-link',
    template: `
        <a [href]="group.controls[field.name].value" matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass">
            {{field.label}}
        </a>
`
})
export class KlesFormLinkComponent extends KlesFieldAbstract implements OnInit {

    ngOnInit() {
        super.ngOnInit();
    }
}
