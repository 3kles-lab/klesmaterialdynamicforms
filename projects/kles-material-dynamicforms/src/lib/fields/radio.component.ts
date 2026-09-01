import { Component, OnDestroy, OnInit, viewChildren } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { KlesFocusTargetDirective } from '../directive/focus-target.directive';

@Component({
    selector: 'kles-form-radiobutton',
    template: `
    <div [formGroup]="group">
        <label class="radio-label-padding">{{label()}}</label>
        <mat-radio-group klesFocusTarget [matTooltip]="tooltip()" [attr.id]="field.id" [ngClass]="ngClass()" [formControlName]="field.name">
            @for (item of options$ | async; track item) {
                <mat-radio-button [value]="item">{{item}}</mat-radio-button>
            }
        </mat-radio-group>
    </div>
`,
    styles: [],
    standalone: true,
    imports: [CommonModule, MatRadioButton, MatRadioGroup, ReactiveFormsModule, MatTooltip, KlesFocusTargetDirective],
})
export class KlesFormRadioComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    private readonly radioButtons = viewChildren(MatRadioButton);

    protected override focus(): void {
        this.radioButtons().at(0)?.focus();
    }

    options$: Observable<any[]> = of([]);

    ngOnInit() {
        super.ngOnInit();

        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options;
        }
        else if (this.field.options instanceof Function) {
            this.options$ = this.field.options();
        }
        else {
            this.options$ = of(this.field.options ?? []);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
