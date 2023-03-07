import { OnInit, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ValidatorFn, AsyncValidatorFn, AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { of, concat } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { EnumType } from './enums/type.enum';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { IKlesValidator } from './interfaces/validator.interface';

@Component({
    exportAs: 'klesDynamicForm',
    selector: 'app-kles-dynamic-form',
    template: `
    <form class="{{orientationClass}}" [formGroup]="form" (submit)="onSubmit($event)">
        <ng-container *ngFor="let field of fields;">
            <ng-container *ngIf="field.visible !== false" class="{{orientationItemClass}}" klesDynamicField [field]="field" [group]="form" [siblingFields]="fields">
            </ng-container>
        </ng-container>
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
            control.setValidators(this.bindValidations(field.validations || []));
            control.setAsyncValidators(this.bindAsyncValidations(field.asyncValidations || []));
            if (field.value && control.value !== field.value) {
                control.setValue(field.value);
            }
            return control;
        }

    }

    private createControl(field: IKlesFieldConfig): AbstractControl {

        if (field.type === EnumType.array) {
            const array = this.fb.array([]);

            if (field.value && Array.isArray(field.value)) {
                if (field.collections && Array.isArray(field.collections)) {
                    field.value.forEach(val => {
                        const group = this.fb.group({});
                        field.collections.forEach(subfield => {
                            const data = val[subfield.name] || null;
                            const control = this.createControl({ ...subfield, ...(data && { value: data }) });
                            group.addControl(subfield.name, control);
                        });
                        array.push(group);
                    });
                }
            } else {
                const group = this.fb.group({});
                field.collections.forEach(subfield => {
                    const control = this.createControl({ ...subfield });
                    group.addControl(subfield.name, control);
                });
                array.push(group);
            }
            return array;
        } else if (field.type === EnumType.group) {
            const subGroup = this.fb.group({});
            if (field.collections && Array.isArray(field.collections)) {
                field.collections.forEach(subfield => {
                    const control = this.createControl(subfield);
                    subGroup.addControl(subfield.name, control);
                });
            }
            return subGroup;
        } else if (field.type === EnumType.range) {
            const range = this.fb.group({
                start: this.fb.control(field.value?.start),
                end: this.fb.control(field.value?.end),
            }, {
                validators: this.bindValidations(field.validations || []),
                asyncValidators: this.bindAsyncValidations(field.asyncValidations || []),
            });

            if (field.disabled) {
                range.disable();
            }
            return range;
        } else {
            const control = this.fb.control(
                field.value,
                {
                    validators: this.bindValidations(field.validations || []),
                    asyncValidators: this.bindAsyncValidations(field.asyncValidations || []),
                    updateOn: field.updateOn || 'change'
                }
            );
            if (field.disabled) {
                control.disable();
            }

            if (field.asyncValue) {
                concat(
                    of({ value: null, pending: true }),
                    field.asyncValue.pipe(
                        take(1),
                        catchError((err) => {
                            console.error(err);
                            return of(null);
                        }),
                        map((value) => ({ value, pending: false }))
                    )
                ).subscribe((response) => {
                    response.pending ? control.disable({ emitEvent: false }) : control.enable({ emitEvent: false });
                    control.setValue(response.value);
                    field.pending = response.pending;
                    field.value = response.value;
                    
                });
            }
            return control;
        }
    }



    // private createControl(field: IKlesFieldConfig): AbstractControl {

    //     if (field.type === 'listField') {
    //         const array = this.fb.array([]);

    //         field.value.forEach((data: any) => {
    //             const subGroup = this.fb.group({});
    //             field.collections.forEach(subfield => {
    //                 const control = this.fb.control(
    //                     data[subfield.name] ? data[subfield.name] : null,
    //                     this.bindValidations(subfield.validations || []),
    //                     this.bindAsyncValidations(subfield.asyncValidations || [])
    //                 );
    //                 subGroup.addControl(subfield.name, control);
    //             });
    //             array.push(subGroup);
    //         });
    //         return array;
    //     } else if (field.type === 'group') {
    //         const subGroup = this.fb.group({});
    //         if (field.collections && Array.isArray(field.collections)) {
    //             field.collections.forEach(subfield => {
    //                 const control = this.fb.control(
    //                     subfield.value,
    //                     this.bindValidations(subfield.validations || []),
    //                     this.bindAsyncValidations(subfield.asyncValidations || [])
    //                 );
    //                 if (subfield.disabled) {
    //                     control.disable();
    //                 }
    //                 subGroup.addControl(subfield.name, control);
    //             });
    //         }
    //         return subGroup;

    //     } else {
    //         const control = this.fb.control(
    //             field.value,
    //             this.bindValidations(field.validations || []),
    //             this.bindAsyncValidations(field.asyncValidations || [])
    //         );
    //         if (field.disabled) {
    //             control.disable();
    //         }
    //         return control;
    //     }
    // }



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

    private validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            control.markAsTouched({ onlySelf: true });
        });
    }
}
