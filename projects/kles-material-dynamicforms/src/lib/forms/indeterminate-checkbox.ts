import { Directive, forwardRef, Renderer2, ElementRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'kles-checkbox-indeterminate',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KlesCheckboxIndeterminateDirective),
      multi: true
    }
  ]
})
export class KlesCheckboxIndeterminateDirective implements ControlValueAccessor {
  private onChange: (value: any) => void;
  private onTouched: () => void;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) { }

  writeValue(value: any): void {
    const checkbox = this.elementRef.nativeElement;
    if (value === -1) {
      this.renderer.setProperty(checkbox, 'indeterminate', true);
      this.renderer.setProperty(checkbox, 'checked', false);
    } else {
      this.renderer.setProperty(checkbox, 'indeterminate', false);
      this.renderer.setProperty(checkbox, 'checked', value);
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('change', ['$event'])
  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onChange(input.checked);
  }

  @HostListener('blur')
  handleBlur(): void {
    this.onTouched();
  }

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }
}
