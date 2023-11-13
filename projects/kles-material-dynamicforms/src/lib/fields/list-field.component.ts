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
            <div *ngFor="let subGroup of formArray.controls let index = index;" class="subfields">
                <ng-container *ngFor="let subfield of field.collections;"
                    klesDynamicField [field]="subfield" [group]="subGroup">
                </ng-container>
                <button mat-icon-button (click)="deleteField(index)" color="primary">
                    <mat-icon>delete_outlined</mat-icon>
                </button>
            </div>
            <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message | translate}}</mat-error>
                }
            </ng-container>
            <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message | translate}}</mat-error>
                }
            </ng-container>
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

