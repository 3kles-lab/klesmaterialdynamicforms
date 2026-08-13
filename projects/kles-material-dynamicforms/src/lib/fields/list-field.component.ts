import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, ValidatorFn, Validators, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { IKlesValidator } from '../interfaces/validator.interface';
import { FieldMapper } from '../decorators/component.decorator';
import { KlesFormArray } from '../controls/array.control';
import { cloneDeep } from 'lodash';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

import { MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { KlesDynamicFieldDirective } from '../directive/dynamic-field.directive';
import { MatIconButton } from '@angular/material/button';

@FieldMapper({ type: 'listfield', factory: (field) => new KlesFormArray(field).create() })
@Component({
    selector: 'kles-form-listfield',
    template: `
        <div [formGroup]="group" class="form-element">
            <div class="label">
                {{ field.label }}
                <button matIconButton color="primary" (click)="addField()">
                    <mat-icon>add</mat-icon>
                </button>
            </div>

            <div class="dynamic-form" [formGroupName]="field.name">
                @for (subGroup of formArray.controls; track subGroup.value._id; let idx = $index) {
                    <div class="subfields">
                        @for (subfield of collections[idx]; track subfield.name) {
                            <ng-container klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="collections[idx]"> </ng-container>
                        }
                        @if (collections[idx]) {
                            <button matIconButton (click)="deleteField(idx)" color="primary">
                                <mat-icon>delete_outlined</mat-icon>
                            </button>
                        }
                    </div>
                }
                @for (validation of field.validations; track validation.name) {
                    <ng-container ngProjectAs="mat-error">
                        @if (group.get(field.name).hasError(validation.name)) {
                            <mat-error>{{ validation.message }}</mat-error>
                        }
                    </ng-container>
                }
                @for (validation of field.asyncValidations; track validation.name) {
                    <ng-container ngProjectAs="mat-error">
                        @if (group.get(field.name).hasError(validation.name)) {
                            <mat-error>{{ validation.message }}</mat-error>
                        }
                    </ng-container>
                }
            </div>
        </div>
    `,
    styles: [
        '.subfields {display: flex; flex-direction: row; gap:5px}',
        `
            .label {
                display: flex;
                align-items: center;
                flex-direction: row;
                gap: 5px;
            }
        `,
    ],
    standalone: true,
    imports: [MatError, MatIcon, MatIconButton, KlesDynamicFieldDirective, ReactiveFormsModule],
})
export class KlesFormListFieldComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    formArray: UntypedFormArray;
    collections: IKlesFieldConfig[][] = [];

    private fb = inject(UntypedFormBuilder);

    ngOnInit(): void {
        this.formArray = this.group.controls[this.field.name] as UntypedFormArray;

        this.collections = this.formArray?.controls?.map(() => {
            return this.field.collections ? cloneDeep(this.field.collections) : [];
        });

        super.ngOnInit();
    }

    private createFormGroup(): UntypedFormGroup {
        const group = this.fb.group({});
        this.field.collections?.forEach((item) => {
            const control = this.fb.control(null, this.bindValidations(item.validations || []), this.bindAsyncValidations(item.asyncValidations || []));
            group.addControl(item.name, control);
        });
        return group;
    }

    deleteField(index: number) {
        this.collections.splice(index, 1);
        this.formArray.removeAt(index);
    }

    addField() {
        this.collections.push(this.field.collections ? cloneDeep(this.field.collections) : []);
        this.formArray.push(this.createFormGroup());
    }

    private bindValidations(validations: IKlesValidator<ValidatorFn>[]): ValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach((valid) => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);
        }
        return null;
    }

    private bindAsyncValidations(validations: IKlesValidator<AsyncValidatorFn>[]): AsyncValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach((valid) => {
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
