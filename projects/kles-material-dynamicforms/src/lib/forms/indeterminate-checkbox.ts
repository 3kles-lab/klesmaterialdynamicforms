
import { Component, forwardRef, Input, AfterViewInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';

@Component({
    selector: 'kles-checkbox-indeterminate',
    template: `
    <mat-checkbox
      #checkbox
      [indeterminate]="isIndeterminate"
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCheckboxModule, ReactiveFormsModule, FormsModule],
})
export class KlesIndeterminateCheckboxComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label = '';
  @Input() color: ThemePalette = 'primary';
  @ViewChild('checkbox') checkbox!: MatCheckbox;

  isIndeterminate = false;
  private innerValue: boolean | -1 = false;

  onChange: any = () => { };
  onTouched: any = () => { };

  ngAfterViewInit(): void {
    // Initial update to ensure state is correct after view init
    this.updateCheckbox(this.innerValue);
  }

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
    if (this.checkbox) {
      this.checkbox.disabled = isDisabled;
    }
  }

  onCheckboxChange(event: MatCheckboxChange): void {
    const checked = event.checked;
    this.onChange(checked);
    this.isIndeterminate = false;
  }

  private updateCheckbox(value: boolean | -1): void {
    if (this.checkbox) {
      if (value === -1) {
        this.isIndeterminate = true;
        this.checkbox.checked = false;
      } else {
        this.isIndeterminate = false;
        this.checkbox.checked = value;
      }
    }
  }
}
