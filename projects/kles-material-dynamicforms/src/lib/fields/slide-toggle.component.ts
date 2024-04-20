
import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from './field.abstract';


@Component({
    selector: 'kles-form-slide-toggle',
    template: `
    <div [formGroup]="group" >
        <mat-slide-toggle matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [color]="field.color" [formControlName]="field.name">{{field.label | translate}}</mat-slide-toggle>
    </div>
`,
    styles: []
})
export class KlesFormSlideToggleComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
