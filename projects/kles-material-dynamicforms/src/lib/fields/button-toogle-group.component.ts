import { Component, OnDestroy, OnInit, viewChildren } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { KlesTransformPipe } from '../pipe/transform.pipe';
import { MatButtonToggle, MatButtonToggleModule } from '@angular/material/button-toggle';
import { KlesFocusTargetDirective } from '../directive/focus-target.directive';

@Component({
    selector: 'kles-form-button-toogle-group',
    template: `
        <div [formGroup]="group" class="form-element">
            <mat-button-toggle-group klesFocusTarget [formControlName]="field.name" [multiple]="field.multiple" [attr.id]="field.id" [ngClass]="ngClass()">
                @for (item of options$ | async; track item) {
                    <mat-button-toggle [value]="item">
                        {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                    </mat-button-toggle>
                }
            </mat-button-toggle-group>
        </div>
`,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, KlesTransformPipe, MatButtonToggleModule, KlesFocusTargetDirective],
})
export class KlesFormButtonToogleGroupComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    private readonly buttonToggles = viewChildren(MatButtonToggle);

    protected override focus(): void {
        this.buttonToggles().at(0)?.focus();
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
