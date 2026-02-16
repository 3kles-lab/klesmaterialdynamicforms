import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";
import { MatIcon } from "@angular/material/icon";
import { KlesTransformPipe } from "../pipe/transform.pipe";
import { CommonModule } from "@angular/common";
import { MatChip, MatChipListbox, MatChipOption } from "@angular/material/chips";
import { MatTooltip } from "@angular/material/tooltip";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: "kles-form-chip",
    template: `
    <div [formGroup]="group">  
        <mat-chip-listbox>
            <mat-chip-option [color]="color()" matTooltip="{{field.tooltip}}" [attr.id]="field.id" selected [ngClass]="ngClass()" [ngStyle]="ngStyle()">
                @if (icon()) {
                    <mat-icon>{{icon()}}</mat-icon>
                }
                {{group.controls[field.name].value | klesTransform:field.pipeTransform}}
            </mat-chip-option>
        </mat-chip-listbox>
    </div>
`,
    styles: [],
    standalone: true,
    imports: [CommonModule, MatIcon, KlesTransformPipe, MatChipOption, MatChipListbox, MatTooltip, ReactiveFormsModule]
})
export class KlesFormChipComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
