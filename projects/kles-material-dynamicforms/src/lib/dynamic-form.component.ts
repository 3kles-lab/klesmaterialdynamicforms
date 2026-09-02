import { OnInit, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, Signal, isDevMode } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ValidatorFn, AsyncValidatorFn, AbstractControl, FormArray, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { componentMapper } from './decorators/component.decorator';
import { EnumType } from './enums/type.enum';
import { klesFieldControlFactory, klesFieldUiFactory } from './factories/field.factory';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { IKlesValidator } from './interfaces/validator.interface';
import { CommonModule } from '@angular/common';

import { MatError } from '@angular/material/form-field';
import { KlesDynamicFieldDirective } from './directive/dynamic-field.directive';
import { MatErrorFormDirective } from './directive/mat-error-form.directive';
import { ErrorStateMatcher } from '@angular/material/core';
import { KlesFormErrorStateMatcher } from './matcher/form-error.matcher';
import { AbstractUiState } from './ui/ui-state/ui-state.abstract';
import { GroupUiState } from './ui/ui-state/group-ui-state';
import { KlesFormElementsComponent } from './form-elements.component';
import { IKlesLayoutConfig, KlesFormElement, flattenKlesFields, isKlesStructuralElement } from './interfaces/layout.interface';

const DEFAULT_GRID_GAP = '0';

@Component({
    exportAs: 'klesDynamicForm',
    selector: 'app-kles-dynamic-form',
    standalone: true,
    template: `
        <form class="{{ orientationClass }}" [class.dynamic-form-nowrap]="orientationClass === 'dynamic-form-row' && wrap === false" [ngClass]="formClass" [ngStyle]="gridStyles" [formGroup]="form" (submit)="onSubmit($event)">
            @if (usesAdvancedLayout) {
                <kles-form-elements [elements]="fields" [group]="form" [ui]="ui" [context]="context" [layoutConfig]="layout" />
            } @else {
                @for (field of legacyFields; track field.name) {
                    @if (field.visible !== false) {
                        <ng-container klesDynamicField [field]="field" [group]="form" [ui]="ui" [siblingFields]="legacyFields" [context]="context"> </ng-container>
                    }
                }
            }
            @if (form && form.errors) {
                <mat-error matErrorForm [form]="form" [validations]="validators" [asyncValidations]="asyncValidators"></mat-error>
            }
        </form>
    `,
    styles: [
        '.dynamic-form-column { display: flex;flex-direction: column; }',
        '.dynamic-form-column > * { width: 100%; }',
        '.dynamic-form-row { display: inline-flex; flex-wrap:wrap; gap:10px; align-items: baseline}',
        '.dynamic-form-row.dynamic-form-nowrap { flex-wrap: nowrap; }',
        '.dynamic-form-row > * { width: 100%; }',
        '.dynamic-form-grid { display: grid; grid-template-columns: repeat(var(--kles-grid-columns, 12), minmax(0, 1fr)); gap: var(--kles-grid-gap, 0); }',
        '.dynamic-form-inline-grid { display: inline-grid; grid-template-columns: repeat(var(--kles-grid-columns, 12), minmax(0, 1fr)); gap: var(--kles-grid-gap, 0); }',
    ],
    providers: [{ provide: ErrorStateMatcher, useClass: KlesFormErrorStateMatcher }],
    imports: [CommonModule, MatErrorFormDirective, KlesDynamicFieldDirective, KlesFormElementsComponent, FormsModule, ReactiveFormsModule, MatError],
})
export class KlesDynamicFormComponent implements OnInit, OnChanges {
    @Input() context: Signal<unknown | null> | null = null;
    @Input() fields: KlesFormElement[] = [];
    @Input() validators: IKlesValidator<ValidatorFn>[] = [];
    @Input() asyncValidators: IKlesValidator<AsyncValidatorFn>[] = [];
    // tslint:disable-next-line: no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onLoaded = new EventEmitter();

    @Input() direction: 'column' | 'row' | 'grid' | 'inline-grid' = 'column';
    @Input() wrap = true;
    /** Configuration of the advanced grid container. */
    @Input() layout: IKlesLayoutConfig = {};
    @Input() formClass: string | string[] | Set<string> | { [klass: string]: any } = '';

    form!: UntypedFormGroup;
    ui!: GroupUiState;
    private flattenedSource: KlesFormElement[] | null = null;
    private flattenedFields: IKlesFieldConfig[] = [];
    private readonly layoutWarnings = new Set<string>();
    get orientationClass(): 'dynamic-form-column' | 'dynamic-form-row' | 'dynamic-form-grid' | 'dynamic-form-inline-grid' {
        if (this.hasRootElementLayout && this.direction !== 'inline-grid') return 'dynamic-form-grid';
        return `dynamic-form-${this.direction}`;
    }

    get value() {
        return this.form.value;
    }

    get legacyFields(): IKlesFieldConfig[] {
        if (this.flattenedSource !== this.fields) {
            this.flattenedSource = this.fields;
            this.flattenedFields = flattenKlesFields(this.fields);
        }
        return this.flattenedFields;
    }

    get usesAdvancedLayout(): boolean {
        return this.direction === 'grid' || this.direction === 'inline-grid' || this.hasRootElementLayout || this.fields.some(isKlesStructuralElement);
    }

    get gridStyles(): Record<string, string | number> | null {
        if (this.orientationClass !== 'dynamic-form-grid' && this.orientationClass !== 'dynamic-form-inline-grid') return null;
        return {
            '--kles-grid-columns': this.normalizeColumns(this.layout.columns),
            '--kles-grid-gap': this.layout.gap?.trim() || DEFAULT_GRID_GAP,
        };
    }

    private get hasRootElementLayout(): boolean {
        return this.fields.some((element) => element.layout != null);
    }

    constructor(
        private fb: UntypedFormBuilder,
        private ref: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.form = this.createForm();
        this.ui = this.createUi();
        this._onLoaded.emit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.fields && !changes.fields.firstChange && this.form) {
            this.updateForm();
            this.ui = this.createUi();
            this._onLoaded.emit();
        }

        if (changes.validators && !changes.validators.firstChange && this.form) {
            this.form.setValidators(this.validators.map((v) => v.validator));
        }

        if (changes.asyncValidators && !changes.asyncValidators.firstChange && this.form) {
            this.form.setAsyncValidators(this.asyncValidators.map((v) => v.validator));
        }

    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.form.valid) {
            this.submit.emit(this.form.getRawValue());
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    private updateForm() {
        const fields = this.legacyFields;
        Object.keys(this.form.controls)
            .filter((key) => {
                return !fields.map((field) => field.name).includes(key);
            })
            .forEach((key) => {
                this.form.removeControl(key);
            });

        fields
            .forEach((field) => {
                if (field.type === EnumType.lineBreak) {
                    return;
                }

                if (this.form.controls[field.name]) {
                    const control = this.updateControl(field, this.form.controls[field.name]);
                    this.form.setControl(field.name, control, { emitEvent: false });
                } else {
                    const control = this.createControl(field);
                    if (control) {
                        this.form.addControl(field.name, control);
                    }
                }
            });
    }

    private updateControl(field: IKlesFieldConfig, control: AbstractControl): AbstractControl {
        if (field.type === EnumType.array) {
            const array = control as FormArray;
            /*TODO*/
            return array;
        } else if (field.type === EnumType.group) {
            const group = control as FormGroup;
            if (field.collections && Array.isArray(field.collections)) {
                field.collections.forEach((subfield) => {
                    const existingControl = group.controls[subfield.name];
                    const updatedControl = existingControl ? this.updateControl(subfield, existingControl) : this.createControl(subfield);

                    if (updatedControl) {
                        group.setControl(subfield.name, updatedControl, { emitEvent: false });
                    }
                });
            }
            return group;
        } else {
            return control;
        }
    }

    private createControl(field: IKlesFieldConfig): AbstractControl | null {
        const mapping = field.type
            ? componentMapper.find((candidate) => candidate.type === field.type)
            : componentMapper.find((candidate) => candidate.component === field.component);

        return mapping ? mapping.factory(field, this.ref) : klesFieldControlFactory(field, this.ref);
    }

    private createUiState(field: IKlesFieldConfig): AbstractUiState {
        const mapping = field.type
            ? componentMapper.find((candidate) => candidate.type === field.type)
            : componentMapper.find((candidate) => candidate.component === field.component);

        return mapping?.ui(field) ?? klesFieldUiFactory(field);
    }

    private createForm() {
        const group = this.fb.group({});

        this.legacyFields.forEach((field) => {
            const control = this.createControl(field);
            if (control) {
                group.addControl(field.name, control);
            }
        });

        group.setValidators(this.validators.map((v) => v.validator));
        group.setAsyncValidators(this.asyncValidators.map((v) => v.validator));

        return group;
    }

    private validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);
            control?.markAsTouched({ onlySelf: true });
        });
    }

    private createUi() {
        const uiGroup = new GroupUiState();

        this.legacyFields.forEach((field) => {
            const uiState = this.createUiState(field);
            if (uiState) {
                uiGroup.addUiState(field.name, uiState);
            }
        });

        return uiGroup;
    }

    private normalizeColumns(value: number | undefined): number {
        if (value == null) return 12;
        const normalized = Number.isFinite(value) ? Math.min(64, Math.max(1, Math.round(value))) : 12;
        const warning = `[KlesDynamicForm] columns=${value} is invalid; using ${normalized}.`;
        if (isDevMode() && normalized !== value && !this.layoutWarnings.has(warning)) {
            this.layoutWarnings.add(warning);
            console.warn(warning);
        }
        return normalized;
    }
}
