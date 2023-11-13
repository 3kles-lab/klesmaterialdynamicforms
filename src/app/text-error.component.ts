
import { OnInit, Component, OnDestroy } from '@angular/core';
import { KlesFieldAbstract } from 'dist/kles-material-dynamicforms';

@Component({
    // selector: '',
    template: `
    <div [formGroup]="group" class="form-element">

        <span matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass">
            {{((field.property && group.controls[field.name].value) ? group.controls[field.name].value[field.property] : group.controls[field.name].value) | klesTransform:field.pipeTransform}}
        </span>

        @for (validation of field.validations; track validation.name) {
            <ng-container ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message | translate}}</mat-error>
                }
            </ng-container>
        }
        @for (validation of field.asyncValidations; track validation.name) {
            <ng-container ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message | translate}}</mat-error>
                }
            </ng-container>
        }
    </div>
    `,
    styles: ['mat-form-field {width: calc(100%)}']
})
export class FormTextWithErrorComponent extends KlesFieldAbstract implements OnInit, OnDestroy {


    ngOnInit(): void {
        super.ngOnInit();
    }


    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
