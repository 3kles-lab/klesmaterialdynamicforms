import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
                {{ label() }}
                <button matIconButton color="primary" (click)="addField()">
                    <mat-icon>add</mat-icon>
                </button>
            </div>

            <div class="dynamic-form" [formGroupName]="field.name">
                @for (subGroup of formArray.controls; track subGroup.value._id; let idx = $index) {
                    <div class="subfields">
                        @for (subfield of collections()[idx]; track subfield.name) {
                            <ng-container klesDynamicField [field]="subfield" [group]="$any(subGroup)" [siblingFields]="collections()[idx]" [context]="context"> </ng-container>
                        }
                        @if (collections()[idx]) {
                            <button matIconButton (click)="deleteField(idx)" color="primary">
                                <mat-icon>delete_outlined</mat-icon>
                            </button>
                        }
                    </div>
                }
                @for (validation of field.validations; track validation.name) {
                    <ng-container ngProjectAs="mat-error">
                        @if (validation.name && group.controls[field.name].hasError(validation.name)) {
                            <mat-error>{{ validation.message }}</mat-error>
                        }
                    </ng-container>
                }
                @for (validation of field.asyncValidations; track validation.name) {
                    <ng-container ngProjectAs="mat-error">
                        @if (validation.name && group.controls[field.name].hasError(validation.name)) {
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
    formArray!: UntypedFormArray;
    readonly collections = signal<IKlesFieldConfig[][]>([]);

    private fb = inject(UntypedFormBuilder);

    ngOnInit(): void {
        this.formArray = this.group.controls[this.field.name] as UntypedFormArray;

        this.collections.set(
            this.formArray.controls.map(() => {
                return this.field.collections ? cloneDeep(this.field.collections) : [];
            }),
        );

        super.ngOnInit();
    }

    private createFormGroup(): UntypedFormGroup {
        const group = this.fb.group({});
        this.field.collections?.forEach((item: any) => {
            const control = this.fb.control(null, this.bindValidations(item.validations || []), this.bindAsyncValidations(item.asyncValidations || []));
            group.addControl(item.name, control);
        });
        return group;
    }

    deleteField(index: number): void {
        this.collections.update((collections) => collections.filter((_, currentIndex) => currentIndex !== index));
        this.formArray.removeAt(index);
    }

    addField(): void {
        const collection = this.field.collections ? cloneDeep(this.field.collections) : [];
        this.collections.update((collections) => [...collections, collection]);
        this.formArray.push(this.createFormGroup());
    }

    private bindValidations(validations: IKlesValidator<ValidatorFn>[]): ValidatorFn | null {
        if (validations.length > 0) {
            const validList: ValidatorFn[] = [];
            validations.forEach((valid) => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);
        }
        return null;
    }

    private bindAsyncValidations(validations: IKlesValidator<AsyncValidatorFn>[]): AsyncValidatorFn | null {
        if (validations.length > 0) {
            const validList: AsyncValidatorFn[] = [];
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
