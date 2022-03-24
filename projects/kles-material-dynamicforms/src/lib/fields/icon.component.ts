import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: "kles-form-icon",
    template: `
        <mat-icon [color]="field.color" matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [ngStyle]="field.ngStyle">
            {{group.controls[field.name].value}}
        </mat-icon>
`,
    styles: []
})
export class KlesFormIconComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
