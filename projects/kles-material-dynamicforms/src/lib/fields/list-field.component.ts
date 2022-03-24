import { Component, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { FormGroup, FormArray, FormBuilder, ValidatorFn, Validators, AsyncValidatorFn } from '@angular/forms';
import { IKlesValidator } from '../interfaces/validator.interface';

@Component({
    selector: 'kles-form-listfield',
    template: `
    <div [formGroup]="group" class="form-element">
        {{field.label | translate}}
        <button mat-icon-button color="primary" (click)="addField()">
            <mat-icon>add</mat-icon>
        </button>

        <div class="dynamic-form" [formGroupName]="field.name">
            <div *ngFor="let subGroup of formArray.controls let index = index;" fxLayout="row" fxLayoutGap="5px">
                <ng-container *ngFor="let subfield of field.collections;"
                    dynamicField [field]="subfield" [group]="subGroup">
                </ng-container>
                <button mat-icon-button (click)="deleteField(index)" color="primary">
                    <mat-icon>delete_outlined</mat-icon>
                </button>
            </div>
            <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
                <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
            </ng-container>
            <ng-container *ngFor="let validation of field.asyncValidations;" ngProjectAs="mat-error">
                <mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message | translate}}</mat-error>
            </ng-container>
        </div>
    </div>
    `,
    styles: []
})
export class KlesFormListFieldComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

    formArray: FormArray;

    constructor(private fb: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        this.formArray = this.group.controls[this.field.name] as FormArray;
        super.ngOnInit();
    }

    private createFormGroup(): FormGroup {
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

