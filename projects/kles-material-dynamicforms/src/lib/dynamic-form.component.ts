import { OnInit, Component, Input, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AsyncValidatorFn, ValidationErrors, AsyncValidator } from '@angular/forms';
import { IFieldConfig, IValidator } from './interfaces';

@Component({
    exportAs: 'dynamicForm',
    selector: 'app-kles-dynamic-form',
    template: `
    <form class="{{orientationClass}}" [formGroup]="form" (submit)="onSubmit($event)">
        <ng-container *ngFor="let field of fields;" class="{{orientationItemClass}}" dynamicField [field]="field" [group]="form">
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
        '.dynamic-form-row { display: inline-flex;flex-wrap:wrap;justify-content:space-between;gap:10px }',
        '.dynamic-form-row > * { width: 100%; }',
        '.dynamic-form-row-item { margin-rigth: 10px; }',
        '.dynamic-form-column-item { margin-bottom: 10px; }',
    ]

})
export class DynamicFormComponent implements OnInit {
    @Input() fields: IFieldConfig[] = [];
    @Input() validators: IValidator<ValidatorFn>[] = [];
    @Input() asyncValidators: IValidator<AsyncValidatorFn>[] = [];
    // tslint:disable-next-line: no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Input() direction: 'column' | 'row' = 'column';

    form: FormGroup;
    orientationClass: 'dynamic-form-column' | 'dynamic-form-row' = 'dynamic-form-column';
    orientationItemClass: 'dynamic-form-column-item' | 'dynamic-form-row-item' = 'dynamic-form-column-item';

    get value() {
        return this.form.value;
    }

    constructor(private fb: FormBuilder) { }


    ngOnInit() {
        this.form = this.createControl();
        this.orientationClass = this.direction === 'row' ? 'dynamic-form-row' : 'dynamic-form-column';
        this.orientationItemClass = this.direction === 'row' ? 'dynamic-form-row-item' : 'dynamic-form-column-item';
    }

    onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('FormValue=', this.form.value);
        if (this.form.valid) {
            this.submit.emit(this.form.value);
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    reset() {
        this.form.reset();
    }

    private createControl() {
        const group = this.fb.group({});
        this.fields.forEach(field => {
            if (field.type === 'button') {
                return;
            }

            if (field.type === 'listField') {
                const array = this.fb.array([]);

                field.value.forEach((data: any) => {
                    const subGroup = this.fb.group({});
                    field.collections.forEach(subfield => {
                        const control = this.fb.control(
                            data[subfield.name] ? data[subfield.name] : null,
                            // null,
                            this.bindValidations(subfield.validations || []),
                            this.bindAsyncValidations(subfield.asyncValidations || [])
                        );
                        subGroup.addControl(subfield.name, control);
                    });
                    array.push(subGroup);
                });

                group.addControl(field.name, array);
            } else {
                const control = this.fb.control(
                    field.value,
                    this.bindValidations(field.validations || []),
                    this.bindAsyncValidations(field.asyncValidations || [])
                );
                if (field.disabled) {
                    control.disable();
                }

                group.addControl(field.name, control);
            }

        });

        group.setValidators(this.validators.map(v => v.validator));
        group.setAsyncValidators(this.asyncValidators.map(v => v.validator));
        return group;
    }


    private bindValidations(validations: IValidator<ValidatorFn>[]): ValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);

        }
        return null;
    }


    private bindAsyncValidations(validations: IValidator<AsyncValidatorFn>[]): AsyncValidatorFn {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.composeAsync(validList);

        }
        return null;
    }

    private validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            control.markAsTouched({ onlySelf: true });
        });
    }
}
