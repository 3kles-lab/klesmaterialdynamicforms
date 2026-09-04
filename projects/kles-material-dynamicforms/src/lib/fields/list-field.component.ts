import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { ReactiveFormsModule, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { FieldMapper } from '../decorators/component.decorator';
import { KlesFormArray } from '../controls/array.control';
import { cloneDeep } from 'lodash';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

import { MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { KlesDynamicFieldDirective } from '../directive/dynamic-field.directive';
import { MatIconButton } from '@angular/material/button';

import { createKlesFormArrayGroup } from '../factories/form-array-group.factory';

@FieldMapper({ type: 'listfield', factory: (field) => new KlesFormArray(field).create() })
@Component({
    selector: 'kles-form-listfield',
    template: `
        <div [formGroup]="group" class="form-element">
            <div class="label">
                {{ label() }}
                <button type="button" matIconButton (click)="addField()">
                    <mat-icon>add</mat-icon>
                </button>
            </div>

            <div class="dynamic-form" [formArrayName]="field.name">
                @for (subGroup of formArray.controls; track subGroup; let idx = $index) {
                    <div class="subfields">
                        @for (subfield of collections()[idx]; track subfield.name) {
                            <ng-container klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="collections()[idx]" [context]="context"> </ng-container>
                        }
                        @if (collections()[idx]) {
                            <button matIconButton type="button" (click)="deleteField(idx)">
                                <mat-icon>delete_outlined</mat-icon>
                            </button>
                        }
                    </div>
                }
                @for (validation of field.validations ?? []; track validation.name) {
                    <ng-container ngProjectAs="mat-error">
                        @if (validation.name && group.controls[field.name].hasError(validation.name)) {
                            <mat-error>{{ validation.message }}</mat-error>
                        }
                    </ng-container>
                }
                @for (validation of field.asyncValidations ?? []; track validation.name) {
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
    formArray: FormArray<FormGroup<Record<string, AbstractControl>>>;
    readonly collections = signal<IKlesFieldConfig[][]>([]);

    constructor() {
        super();
        this.formArray = this.group.controls[this.field.name] as FormArray<FormGroup<Record<string, AbstractControl>>>;
        this.collections.set(
            this.formArray.controls.map(() => {
                return cloneDeep(this.field.collections ?? []);
            }),
        );
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    deleteField(index: number): void {
        this.formArray.removeAt(index);
        this.collections.update((collections) => collections.filter((_, currentIndex) => currentIndex !== index));
    }

    addField(): void {
        this.formArray.push(createKlesFormArrayGroup(this.field));
        this.collections.update((collections) => [...collections, cloneDeep(this.field.collections ?? [])]);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
