import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[klesFocusTarget]',
    standalone: true,
})
export class KlesFocusTargetDirective {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    focus(): void {
        this.element.nativeElement.focus();
    }
}
