import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KlesFieldAbstract } from './field.abstract';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { KlesTransformPipe } from '../pipe/transform.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
    selector: 'kles-form-button-toogle-group',
    template: `
        <div [formGroup]="group" class="form-element">
            <mat-button-toggle-group [formControlName]="field.name" [multiple]="field.multiple" [attr.id]="field.id" [ngClass]="ngClass()">
                @for (item of options$ | async; track item) {
                    <mat-button-toggle [value]="item">
                        {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                    </mat-button-toggle>
                }
            </mat-button-toggle-group>
        </div>
`,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, ReactiveFormsModule, KlesTransformPipe, MatButtonToggleModule],
})
export class KlesFormButtonToogleGroupComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    options$: Observable<any[]>;

    ngOnInit() {
        super.ngOnInit();

        if (this.field.options instanceof Observable) {
            this.options$ = this.field.options;
        }
        else if (this.field.options instanceof Function) {
            this.options$ = this.field.options();
        }
        else {
            this.options$ = of(this.field.options);
        }
    }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
