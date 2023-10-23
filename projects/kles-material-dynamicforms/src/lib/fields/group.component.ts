import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { KlesFormGroup } from '../controls/group.control';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.group, factory: (field) => (new KlesFormGroup(field).create()) })
@Component({
    selector: 'kles-group',
    template: `
    <div [formGroup]="group" class="group-container">
        <div [formGroupName]="field.name" class="group-container" [style.flex-direction]="field.direction || 'inherit'" [ngClass]="field.ngClass">
            <ng-container *ngFor="let subfield of field.collections;">
                <ng-container *ngIf="subfield.visible !== false" klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="field.collections">
                </ng-container>
            </ng-container>
        </div>
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
        <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
            <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
        </ng-container>
    </div>
`,
    styles: ['mat-form-field {width: calc(100%)}',
        ':host { display:flex; flex-direction: inherit}',
        // '.row { gap:10px;}',
        // '.group-container {display:flex; flex-direction: inherit; width: inherit; flex-wrap: wrap}'
        '.group-container {display:flex; flex-direction: inherit; width: inherit;}'
    ]
})
export class KlesFormGroupComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    subGroup: UntypedFormGroup;

    ngOnInit() {
        this.subGroup = this.group.controls[this.field.name] as UntypedFormGroup;
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
