import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: "kles-form-chip",
    template: `
    <div [formGroup]="group">  
        <mat-chip-listbox>
            <mat-chip-option [color]="field.color" matTooltip="{{field.tooltip}}" [attr.id]="field.id" selected [ngClass]="field.ngClass" [ngStyle]="field.ngStyle">
                @if (field.icon) {
                    <mat-icon>{{field.icon}}</mat-icon>
                }
                {{group.controls[field.name].value | klesTransform:field.pipeTransform}}
            </mat-chip-option>
        </mat-chip-listbox>
    </div>
`,
    styles: []
})
export class KlesFormChipComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
