import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: "kles-form-icon",
    template: `
        <mat-icon [color]="field.color" matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [ngStyle]="field.ngStyle">
            {{group.controls[field.name].value}}
        </mat-icon>
`,
    styles: [],
    standalone: true,
    imports: [CommonModule, MatIcon, MatTooltip]
})
export class KlesFormIconComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
