import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KlesDynamicFormComponent } from './dynamic-form.component';
import { KlesFormInputComponent } from './fields/input.component';
import { IKlesFieldConfig } from './interfaces/field.config.interface';

describe('KlesDynamicFormComponent', () => {
    it('prevents wrapping in row direction when wrap is false', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('direction', 'row');
        fixture.componentRef.setInput('wrap', false);
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        expect(form.classList).toContain('dynamic-form-row');
        expect(form.classList).toContain('dynamic-form-nowrap');
    });

    it('focuses the explicitly declared target when autofocus is enabled', async () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture.componentRef.setInput('fields', [
            {
                name: 'focusedField',
                component: KlesFormInputComponent,
                autofocus: true,
            },
        ] satisfies IKlesFieldConfig[]);
        fixture.detectChanges();
        await fixture.whenStable();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(document.activeElement).toBe(input);
    });

    it('rebuilds the GroupUiState when the fields input changes', () => {
        TestBed.configureTestingModule({
            imports: [KlesDynamicFormComponent, KlesFormInputComponent, NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(KlesDynamicFormComponent);
        const initialFields: IKlesFieldConfig[] = [
            {
                name: 'first',
                component: KlesFormInputComponent,
                appearance: 'fill',
            },
        ];
        fixture.componentRef.setInput('fields', initialFields);
        fixture.detectChanges();

        const initialUi = fixture.componentInstance.ui;
        expect(initialUi.get('first')?.value()?.appearance).toBe('fill');

        const nextFields: IKlesFieldConfig[] = [
            {
                name: 'second',
                component: KlesFormInputComponent,
                appearance: 'outline',
            },
        ];
        fixture.componentRef.setInput('fields', nextFields);
        fixture.detectChanges();

        expect(fixture.componentInstance.ui).not.toBe(initialUi);
        expect(fixture.componentInstance.ui.get('first')).toBeNull();
        expect(fixture.componentInstance.ui.get('second')?.value()?.appearance).toBe('outline');
        expect(fixture.componentInstance.form.get('first')).toBeNull();
        expect(fixture.componentInstance.form.get('second')).toBeInstanceOf(FormControl);
    });
});
