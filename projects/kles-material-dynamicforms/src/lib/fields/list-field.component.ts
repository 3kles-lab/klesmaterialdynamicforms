import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { KlesFieldAbstract } from './field.abstract';
import { ReactiveFormsModule, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { FieldMapper } from '../decorators/component.decorator';
import { KlesFormArray } from '../controls/array.control';
import { cloneDeep } from 'lodash';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

import { MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { KlesDynamicFieldDirective } from '../directive/dynamic-field.directive';
import { MatButtonModule, MatIconButton } from '@angular/material/button';

import { createKlesFormArrayGroup } from '../factories/form-array-group.factory';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { MatErrorFormDirective } from '../directive/mat-error-form.directive';

@FieldMapper({ type: 'listfield', factory: (field) => new KlesFormArray(field).create() })
@Component({
    selector: 'kles-form-listfield',
    template: `
        <div [formGroup]="group" class="form-element list-field">
            <div class="list-field__header">
                @if (label()) {
                    <span class="list-field__label">
                        {{ label() }}
                    </span>
                }

                <button type="button" matButton class="list-field__add" (click)="addField()">
                    <mat-icon>add</mat-icon>
                    {{ intl.add }}
                </button>
            </div>

            <div class="list-field__content" [formArrayName]="field.name">
                @for (subGroup of formArray.controls; track subGroup; let idx = $index) {
                    <div class="list-field__row">
                        <div class="list-field__fields">
                            @for (subfield of collections()[idx]; track subfield.name) {
                                <div class="list-field__field" [style.grid-column]="getGridColumn(subfield)" [style.grid-row]="getGridRow(subfield)">
                                    <ng-container klesDynamicField [field]="subfield" [group]="subGroup" [siblingFields]="collections()[idx]" [context]="context" />
                                </div>
                            }
                        </div>

                        <button type="button" matIconButton class="list-field__delete" [attr.aria-label]="intl.delete" (click)="deleteField(idx)">
                            <mat-icon>delete_outline</mat-icon>
                        </button>
                    </div>
                }

                @if (formArray.length === 0) {
                    <div class="list-field__empty">
                        {{ intl.empty }}
                    </div>
                }
            </div>

            <div class="list-field__errors">
                <mat-error matErrorForm [form]="formArray" [validations]="field.validations" [asyncValidations]="field.asyncValidations" />
            </div>
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                min-width: 0;
            }

            .list-field {
                display: flex;
                flex-direction: column;
                gap: 8px;

                width: 100%;
                min-width: 0;
            }

            .list-field__header {
                display: flex;
                align-items: center;
                gap: 8px;

                min-height: 36px;
            }

            .list-field__label {
                min-width: 0;

                font-weight: 500;
            }

            .list-field__add {
                margin-left: auto;
                flex-shrink: 0;
            }

            .list-field__content {
                display: flex;
                flex-direction: column;
                gap: 10px;

                width: 100%;
                min-width: 0;
            }

            .list-field__row {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                align-items: start;

                gap: 8px;

                width: 100%;
                min-width: 0;
            }

            .list-field__fields {
                display: grid;
                grid-template-columns: repeat(12, minmax(0, 1fr));

                gap: 12px;

                width: 100%;
                min-width: 0;
            }

            .list-field__field {
                width: 100%;
                min-width: 0;
            }

            .list-field__delete {
                flex-shrink: 0;
                margin-top: 4px;
            }

            .list-field__empty {
                padding: 16px;

                text-align: center;
                opacity: 0.7;
            }

            .list-field__errors {
                display: flex;
                flex-direction: column;
                gap: 4px;

                min-width: 0;
            }
        `,
    ],
    standalone: true,
    imports: [MatError, MatIcon, MatIconButton, KlesDynamicFieldDirective, ReactiveFormsModule, MatButtonModule, MatErrorFormDirective],
})
export class KlesFormListFieldComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    readonly intl = inject(KlesDynamicFormIntl);

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

    getGridColumn(field: IKlesFieldConfig): string {
        const colSpan = field.layout?.colSpan ?? 12;
        const colStart = field.layout?.colStart;

        if (colStart) {
            return `${colStart} / span ${colSpan}`;
        }

        return `span ${colSpan}`;
    }

    getGridRow(field: IKlesFieldConfig): string | undefined {
        const rowSpan = field.layout?.rowSpan;
        const rowStart = field.layout?.rowStart;

        if (rowStart && rowSpan) {
            return `${rowStart} / span ${rowSpan}`;
        }

        if (rowStart) {
            return `${rowStart}`;
        }

        if (rowSpan) {
            return `span ${rowSpan}`;
        }

        return undefined;
    }
}
