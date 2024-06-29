import { OnInit, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ValidatorFn, AsyncValidatorFn, AbstractControl, FormArray, FormGroup, FormControlDirective, FormControlName } from '@angular/forms';
import { componentMapper } from './decorators/component.decorator';
import { EnumType } from './enums/type.enum';
import { klesFieldControlFactory } from './factories/field.factory';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { IKlesValidator } from './interfaces/validator.interface';

const originFormControlNgOnChanges = FormControlDirective.prototype.ngOnChanges;
FormControlDirective.prototype.ngOnChanges = function () {
    this.form.nativeElement = this.valueAccessor._elementRef?.nativeElement;
    return originFormControlNgOnChanges.apply(this, arguments);
};

const originFormControlNameNgOnChanges = FormControlName.prototype.ngOnChanges;
FormControlName.prototype.ngOnChanges = function () {
    const result = originFormControlNameNgOnChanges.apply(this, arguments);
    this.control.nativeElement = this.valueAccessor._elementRef?.nativeElement;
    return result;
};

@Component({
    exportAs: 'klesDynamicForm',
    selector: 'app-kles-dynamic-form',
    template: `
    <form class="{{orientationClass}}" [ngClass]="formClass" [formGroup]="form" (submit)="onSubmit($event)">
        @for (field of fields; track field.name) {
            @if (field.visible !== false) {
                <ng-container klesDynamicField [field]="field" [group]="form" [siblingFields]="fields">
                </ng-container>
            }
        }
        <mat-error matErrorForm [validations]="validators" [asyncValidations]="asyncValidators"></mat-error>
    </form>
    `,
    styles: [
        '.dynamic-form-column { display: flex;flex-direction: column; }',
        '.dynamic-form-column > * { width: 100%; }',
        '.dynamic-form-row { display: inline-flex; flex-wrap:wrap; gap:10px; }',
        '.dynamic-form-row > * { width: 100%; }',
        '.dynamic-form-grid { display: grid; }',
        '.dynamic-form-inline-grid { display: inline-grid; }',
    ]

})
export class KlesDynamicFormComponent implements OnInit, OnChanges {
    @Input() fields: IKlesFieldConfig[] = [];
    @Input() validators: IKlesValidator<ValidatorFn>[] = [];
    @Input() asyncValidators: IKlesValidator<AsyncValidatorFn>[] = [];
    // tslint:disable-next-line: no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onLoaded = new EventEmitter();

    @Input() direction: 'column' | 'row' | 'grid' | 'inline-grid' = 'column';
    @Input() formClass: string | string[] | Set<string> | { [klass: string]: any; };

    form: UntypedFormGroup;
    orientationClass: 'dynamic-form-column' | 'dynamic-form-row' | 'dynamic-form-grid' | 'dynamic-form-inline-grid' = 'dynamic-form-column';

    get value() {
        return this.form.value;
    }

    constructor(private fb: UntypedFormBuilder) { }


    ngOnInit() {
        this.form = this.createForm();
        this.setOrientationClass();
        this._onLoaded.emit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.fields?.firstChange) {
            this.updateForm();
            this._onLoaded.emit();
        }

        if (!changes.validators?.firstChange && this.form) {
            this.form.setValidators(this.validators.map(v => v.validator));
        }

        if (!changes.asyncValidators?.firstChange && this.form) {
            this.form.setAsyncValidators(this.asyncValidators.map(v => v.validator));
        }

        if (!changes.direction?.firstChange) {
            this.orientationClass = this.direction === 'row' ? 'dynamic-form-row' : 'dynamic-form-column';
        }

    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.form.valid) {
            this.submit.emit(this.form.value);
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    private setOrientationClass() {
        switch (this.direction) {
            case 'column':
                this.orientationClass = 'dynamic-form-column';
                break;
            case 'row':
                this.orientationClass = 'dynamic-form-row';
                break;
            case 'grid':
                this.orientationClass = 'dynamic-form-grid';
                break;
            case 'inline-grid':
                this.orientationClass = 'dynamic-form-inline-grid';
                break;

        }
    }

    private updateForm() {
        Object.keys(this.form.controls).filter(key => {
            return !this.fields.map(field => field.name).includes(key);
        }).forEach(key => {
            this.form.removeControl(key);
        });

        this.fields
            // .filter(field => !this.form.controls[field.name])
            .forEach(field => {
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
                field.collections.forEach(subfield => {
                    if (group.controls[subfield]) {
                        control = this.updateControl(subfield, group.controls[subfield]);
                    } else {
                        control = this.createControl(subfield);
                    }
                    if (control) {
                        group.setControl(subfield.name, control, { emitEvent: false });
                    }

                });
            }
            return group;
        } else {
            // control.setValidators(this.bindValidations(field.validations || []));
            // control.setAsyncValidators(this.bindAsyncValidations(field.asyncValidations || []));
            // if (field.value && control.value !== field.value) {
            //     control.setValue(field.value);
            // }
            return control;
        }

    }

    private createControl(field: IKlesFieldConfig): AbstractControl {
        if (field.type) {
            return componentMapper.find(c => c.type === field.type)?.factory
                ? componentMapper.find(c => c.type === field.type)?.factory(field) : klesFieldControlFactory(field);
        } else {
            return componentMapper.find(c => c.component === field.component)?.factory ?
                componentMapper.find(c => c.component === field.component)?.factory(field) : klesFieldControlFactory(field);
        }
    }

    private createForm() {
        const group = this.fb.group({});

        this.fields.forEach(field => {
            const control = this.createControl(field);
            if (control) {
                group.addControl(field.name, control);
            }
        });

        group.setValidators(this.validators.map(v => v.validator));
        group.setAsyncValidators(this.asyncValidators.map(v => v.validator));

        return group;
    }

    private validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            control.markAsTouched({ onlySelf: true });
        });
    }
}
