
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.checkbox })
@Component({
    selector: 'kles-form-checkbox',
    template: `
    <div [formGroup]="group" >  
        <mat-checkbox matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass" [indeterminate]="field.indeterminate" [color]="field.color" [formControlName]="field.name">{{field.label | translate}}</mat-checkbox>
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        </ng-container>
    </div>
`,
    styles: []
})
export class KlesFormCheckboxComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
