
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { takeUntil } from 'rxjs/operators';

@FieldMapper({ type: EnumType.checkbox })
@Component({
  selector: 'kles-form-checkbox',
  template: `
    <div [formGroup]="group" >
        <mat-checkbox matTooltip="{{field.tooltip}}" [attr.id]="field.id"
        [ngClass]="field.ngClass" [(indeterminate)]="field.indeterminate"
        [color]="field.color" [formControlName]="field.name">{{field.label | translate}}</mat-checkbox>
        @for (validation of field.validations; track validation.name) {
            <ng-container ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message}}</mat-error>
                }
            </ng-container>
        }
        @for (validation of field.asyncValidations; track validation.name) {
            <ng-container ngProjectAs="mat-error">
                @if (group.get(field.name).hasError(validation.name)) {
                    <mat-error>{{validation.message}}</mat-error>
                }
            </ng-container>
        }
    </div>
`,
  styles: []
})
export class KlesFormCheckboxComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
  ngOnInit() {
    super.ngOnInit();
    this.field.indeterminate = this.group.getRawValue()[this.field.name] === -1;
    this.group.controls[this.field.name].valueChanges.pipe(takeUntil(this._onDestroy)).subscribe((newVal) => {
      this.field.indeterminate = (newVal === -1);
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
