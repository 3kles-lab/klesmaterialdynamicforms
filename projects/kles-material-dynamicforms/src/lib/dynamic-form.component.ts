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
    <form class="{{orientationClass}}" [formGroup]="form" (submit)="onSubmit($event)">
        @for (field of fields; track field.name) {
            @if (field.visible !== false) {
                <ng-container class="{{orientationItemClass}}" klesDynamicField [field]="field" [group]="form" [siblingFields]="fields">
                </ng-container>
            }
        }
        <!--<button (click)="reset()" mat-raised-button color="primary">RESET</button>-->
    </form>
    `,
    styles: [
        // '.dynamic-form {display: flex; flex-direction: column;}',
        //'.dynamic-form {display: flex;}',
        //'.dynamic-form { width: 100%; }',
        '.dynamic-form-column { display: flex;flex-direction: column; }',
        '.dynamic-form-column > * { width: 100%; }',
        '.dynamic-form-row { display: inline-flex;flex-wrap:wrap;gap:10px }',
        '.dynamic-form-row > * { width: 100%; }',
        '.dynamic-form-row-item { margin-right: 10px; }',
        '.dynamic-form-column-item { margin-bottom: 10px; }',
    ]

})
export class KlesDynamicFormComponent implements OnInit, OnChanges {
    @Input() fields: IKlesFieldConfig[] = [];
    @Input() validators: IKlesValidator<ValidatorFn>[] = [];
    @Input() asyncValidators: IKlesValidator<AsyncValidatorFn>[] = [];
    // tslint:disable-next-line: no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onLoaded = new EventEmitter();

    @Input() direction: 'column' | 'row' = 'column';

    form: UntypedFormGroup;
    orientationClass: 'dynamic-form-column' | 'dynamic-form-row' = 'dynamic-form-column';
    orientationItemClass: 'dynamic-form-column-item' | 'dynamic-form-row-item' = 'dynamic-form-column-item';

    get value() {
        return this.form.value;
    }

    constructor(private fb: UntypedFormBuilder) { }


    ngOnInit() {
        this.form = this.createForm();
        this.orientationClass = this.direction === 'row' ? 'dynamic-form-row' : 'dynamic-form-column';
        this.orientationItemClass = this.direction === 'row' ? 'dynamic-form-row-item' : 'dynamic-form-column-item';
        this._onLoaded.emit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.fields?.firstChange) {
            this.updateForm();
            // this.form = this.createControl();
            // this.form.controls = {};
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
            this.orientationItemClass = this.direction === 'row' ? 'dynamic-form-row-item' : 'dynamic-form-column-item';
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

    reset() {
        this.form.reset();
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
                    this.form.addControl(field.name, control);
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
                    group.setControl(subfield.name, control, { emitEvent: false });
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
            return componentMapper.find(c => c.type === field.type)?.factory(field) || klesFieldControlFactory(field);
        } else {
            return componentMapper.find(c => c.component === field.component)?.factory(field) || klesFieldControlFactory(field);
        }
    }


    private createForm() {
        const group = this.fb.group({});

        this.fields.forEach(field => {

            if (field.type === EnumType.lineBreak) {
                return;
            }
            const control = this.createControl(field);

            group.addControl(field.name, control);
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
