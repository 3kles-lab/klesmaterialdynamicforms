import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: "kles-form-chip",
    template: `
    <div [formGroup]="group">  
        <mat-chip-list>
            <mat-chip [color]="field.color" matTooltip="{{field.tooltip}}" [attr.id]="field.id" selected [ngClass]="field.ngClass" [ngStyle]="field.ngStyle">
                <mat-icon *ngIf="field.icon">{{field.icon}}</mat-icon>
                {{group.controls[field.name].value | klesTransform:field.pipeTransform}}
            </mat-chip>
        </mat-chip-list>
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
