import { IKlesField } from '../interfaces/field.interface';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FormGroup } from '@angular/forms';
import { AfterViewInit, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

export abstract class KlesFieldAbstract implements IKlesField, OnInit, AfterViewInit {
    field: IKlesFieldConfig;
    group: FormGroup;
    siblingFields: IKlesFieldConfig[];

    ngOnInit(): void {
        // this.applyPipeTransform();
        if (this.field.valueChanges) {
            this.field.valueChanges(this.field, this.group, this.siblingFields);
        }

        this.group.controls[this.field.name]?.valueChanges
            .pipe()
            .subscribe(val => {
                if (this.field.valueChanges) {
                    this.field.valueChanges(this.field, this.group, this.siblingFields);
                }

                // this.applyPipeTransform();
            });
    }

    ngAfterViewInit(): void {

    }

    applyPipeTransform() {
        if (this.group && this.field) {
            const control = this.group.controls[this.field.name];
            if (control) {
                const val = this.group.controls[this.field.name].value;
                if (this.field.pipeTransform) {
                    this.field.pipeTransform.forEach(p => {
                        let pipeVal = control.value;
                        if (p.options) {
                            p.options.forEach(opt => {
                                pipeVal = p.pipe.transform(val, opt);
                            });
                        } else {
                            pipeVal = p.pipe.transform(val);
                        }
                        control.patchValue(pipeVal, { onlySelf: true, emitEvent: false });
                    })
                }
            }
        }
    }
}
