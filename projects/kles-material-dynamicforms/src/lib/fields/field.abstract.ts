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
    if (!this.field.appearance) {
      this.field.appearance = 'fill';
    }
    if (this.field.valueChanges) {
      this.field.valueChanges(this.field, this.group, this.siblingFields);
    }

    this.group.controls[this.field.name]?.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(val => {
        if (this.field.valueChanges) {
          this.field.valueChanges(this.field, this.group, this.siblingFields, val);
        }
      });

    if (this.field.directive) {
      this.directive = new this.field.directive(this.viewRef, this);
      this.directive.ngOnInit();
    }
  }

  ngAfterViewInit(): void {
    if (this.directive && this.directive.ngAfterViewInit) {
      this.directive?.ngAfterViewInit();
    }


    if (this.field.autofocus) {
      setTimeout(() => {
        (<any>this.group.controls[this.field.name])?.nativeElement.focus();
      })
    }
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

  isPending() {
    return (this.group.controls[this.field.name].pending || this.field.pending);
  }

  onFocus() {
    if (this.field?.onFocus) {
      this.field.onFocus(this.field, this.group);
    }
  }

  onBlur() {
    if (this.field?.onBlur) {
      this.field.onBlur(this.field, this.group);
    }
  }
}
