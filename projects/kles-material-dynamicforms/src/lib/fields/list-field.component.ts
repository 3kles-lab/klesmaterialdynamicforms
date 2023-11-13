import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, ValidatorFn, Validators, AsyncValidatorFn } from '@angular/forms';
import { IKlesValidator } from '../interfaces/validator.interface';
import { FieldMapper } from '../decorators/component.decorator';
import { KlesFormArray } from '../controls/array.control';

@FieldMapper({ type: 'listfield', factory: (field) => (new KlesFormArray(field).create()) })
@Component({
    selector: 'kles-form-listfield',
    template: `
    <div [formGroup]="group" class="form-element">
        {{field.label | translate}}
        <button mat-icon-button color="primary" (click)="addField()">
            <mat-icon>add</mat-icon>
        </button>

        <div class="dynamic-form" [formGroupName]="field.name">
            @for (subGroup of formArray.controls; track subGroup.value._id) {
                <div class="subfields">
                    @for (subfield of field.collections; track subfield.name) {
                        <ng-container klesDynamicField [field]="subfield" [group]="subGroup">
                        </ng-container>
                    }
                    <button mat-icon-button (click)="deleteField($index)" color="primary">
                        <mat-icon>delete_outlined</mat-icon>
                    </button>
                </div>
            }
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
    </div>
    `,
    styles: ['.subfields {display: flex; flex-direction: row; gap:5px}',]
})
export class KlesFormListFieldComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    formArray: UntypedFormArray;

    constructor(private fb: UntypedFormBuilder, protected viewRef: ViewContainerRef) {
        super(viewRef);
    }

    ngOnInit(): void {
        this.formArray = this.group.controls[this.field.name] as UntypedFormArray;
        super.ngOnInit();
    }

    private createFormGroup(): UntypedFormGroup {
        const group = this.fb.group({});
        this.field.collections.forEach(item => {
            const control = this.fb.control(
                null,
                this.bindValidations(item.validations || []),
                this.bindAsyncValidations(item.asyncValidations || [])
            );
            group.addControl(item.name, control);

        });

        return group;

    }

    deleteField(index: number) {
        this.formArray.removeAt(index);
    }

    addField() {
        this.formArray.push(this.createFormGroup());
    }


    private bindValidations(validations: IKlesValidator<ValidatorFn>[]): ValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);

        }
        return null;
    }


    private bindAsyncValidations(validations: IKlesValidator<AsyncValidatorFn>[]): AsyncValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.composeAsync(validList);

        }
        return null;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}

