
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({ type: EnumType.checkbox })
@Component({
  selector: 'kles-form-checkbox-indeterminate',
  template: `
    <div [formGroup]="group" >
        <kles-checkbox-indeterminate matTooltip="{{field.tooltip}}" [attr.id]="field.id"
        [ngClass]="field.ngClass" [(indeterminate)]="field.indeterminate"
        [color]="field.color" [formControlName]="field.name">{{field.label | translate}}</kles-checkbox-indeterminate>
    </div>
`,
  styles: []
})
export class KlesFormCheckboxIndeterminateComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
