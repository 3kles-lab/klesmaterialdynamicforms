import { IKlesField } from '../interfaces/field.interface';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FormGroup } from '@angular/forms';
import { AfterViewInit, OnInit } from '@angular/core';

export abstract class KlesFieldAbstract implements IKlesField, OnInit, AfterViewInit {
    field: IKlesFieldConfig;
    group: FormGroup;

    ngOnInit(): void {
        this.applyPipeTransform();
        this.group.controls[this.field.name].valueChanges
            .pipe()
            .subscribe(val => {
                this.applyPipeTransform();
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
                        const pipeVal = (p.options) ? p.pipe.transform(val, p.options) : p.pipe.transform(val);
                        control.patchValue(pipeVal);
                    })
                }
            }
        }
    }
}
