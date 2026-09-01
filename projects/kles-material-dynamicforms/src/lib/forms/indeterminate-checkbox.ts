
import { Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';

@Component({
    selector: 'kles-checkbox-indeterminate',
    template: `
    <mat-checkbox
      [indeterminate]="isIndeterminate"
      [checked]="isChecked"
      [disabled]="disabled"
      (change)="onCheckboxChange($event)"
      [color]="color"
      (blur)="onTouched()">
      {{label}}
    </mat-checkbox>
  `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesIndeterminateCheckboxComponent),
            multi: true
        }
    ],
    standalone: true,
    imports: [MatCheckboxModule, ReactiveFormsModule, FormsModule],
})
export class KlesIndeterminateCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() color: ThemePalette = 'primary';

  private readonly indeterminateState = signal(false);
  private readonly checkedState = signal(false);
  private readonly disabledState = signal(false);
  private innerValue: boolean | -1 = false;

  get isIndeterminate(): boolean {
    return this.indeterminateState();
  }

  get isChecked(): boolean {
    return this.checkedState();
  }

  get disabled(): boolean {
    return this.disabledState();
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: boolean | -1 | null): void {
    this.innerValue = value ?? false;
    this.updateCheckbox(this.innerValue);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  onCheckboxChange(event: MatCheckboxChange): void {
    const checked = event.checked;
    this.onChange(checked);
    this.indeterminateState.set(false);
    this.checkedState.set(checked);
  }

  private updateCheckbox(value: boolean | -1): void {
    this.indeterminateState.set(value === -1);
    this.checkedState.set(value === -1 ? false : value);
  }
}
