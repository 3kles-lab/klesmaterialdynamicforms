import { IKlesField } from '../interfaces/field.interface';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { UntypedFormGroup } from '@angular/forms';
import { AfterViewInit, OnDestroy, OnInit, Directive, ViewContainerRef, HostBinding } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive()
export abstract class KlesFieldAbstract implements IKlesField, OnInit, AfterViewInit, OnDestroy {
    field: IKlesFieldConfig;
    group: UntypedFormGroup;
    siblingFields: IKlesFieldConfig[];

    @HostBinding('attr.klesDirective') directive;

    protected _onDestroy = new Subject<void>();

    constructor(protected viewRef: ViewContainerRef) {

    }

    ngOnInit(): void {
        // this.applyPipeTransform();
        if (this.field.valueChanges) {
            this.field.valueChanges(this.field, this.group, this.siblingFields);
        }

        this.group.controls[this.field.name]?.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(val => {
                if (this.field.valueChanges) {
                    this.field.valueChanges(this.field, this.group, this.siblingFields, val);
                }
                // this.applyPipeTransform();
            });

        if (this.field.directive) {
            this.directive = new this.field.directive(this.viewRef, this);
            this.directive.ngOnInit();
        }
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this.directive?.ngOnDestroy();
        this._onDestroy.next();
        this._onDestroy.complete();
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
                    });
                }
            }
        }
    }
}
