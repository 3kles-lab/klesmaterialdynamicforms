import { IField } from '../interfaces/field.interface';
import { IFieldConfig } from '../interfaces/field.config.interface';
import { FormGroup } from '@angular/forms';
import { AfterViewInit, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export abstract class FieldAbstract implements IField, OnInit, AfterViewInit {
    field: IFieldConfig;
    group: FormGroup;

    ngOnInit(): void {
        this.applyPipeTransform();
        console.log('FieldAbstract ngOninit', this.group.controls[this.field.name]);
        this.group.controls[this.field.name].valueChanges
            .pipe()
            .subscribe(val => {
                console.log(' FieldAbstract Value before transform:', val);
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
