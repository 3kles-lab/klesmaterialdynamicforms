import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KlesDynamicFormComponent } from './dynamic-form.component';
import { EnumType } from './enums/type.enum';
import { KlesFormButtonComponent } from './fields/button-form.component';
import { KlesFormFabComponent } from './fields/button-fab.component';
import { KlesFormMiniFabComponent } from './fields/button-mini-fab.component';
import { KlesFormIconButtonComponent } from './fields/button-icon.component';
import { KlesFormGroupComponent } from './fields/group.component';
import { KlesButtonComponent } from './forms/button-control.component';
import { KlesFabComponent } from './forms/fab-control.component';
import { KlesMiniFabComponent } from './forms/mini-fab-control.component';
import { KlesIconButtonComponent } from './forms/icon-button-control.component';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import { KlesFormElement } from './interfaces/layout.interface';

@Component({
    standalone: true,
    imports: [KlesDynamicFormComponent],
    template: `
        <app-kles-dynamic-form [fields]="fields" [submitting]="saving()" (submit)="save($event)" />
        <app-kles-dynamic-form [fields]="fields" />
    `,
})
class SubmissionHost {
    readonly saving = signal(false);
    readonly fields: IKlesFieldConfig[] = [{ name: 'save', component: KlesFormButtonComponent, buttonType: 'submit', label: 'Save' }];
    readonly save = jasmine.createSpy('save').and.callFake(() => this.saving.set(true));
}

describe('Dynamic form submission state', () => {
    let fixture: ComponentFixture<any>;
    afterEach(() => fixture?.destroy());

    const createForm = (fields: KlesFormElement[]) => {
        TestBed.configureTestingModule({ imports: [KlesDynamicFormComponent, KlesFormGroupComponent, NoopAnimationsModule] });
        const formFixture = TestBed.createComponent(KlesDynamicFormComponent);
        fixture = formFixture;
        formFixture.componentRef.setInput('fields', fields);
        formFixture.detectChanges();
        return formFixture;
    };

    const variants = [
        { name: 'standard', field: KlesFormButtonComponent, control: KlesButtonComponent },
        { name: 'fab', field: KlesFormFabComponent, control: KlesFabComponent },
        { name: 'mini-fab', field: KlesFormMiniFabComponent, control: KlesMiniFabComponent },
        { name: 'icon', field: KlesFormIconButtonComponent, control: KlesIconButtonComponent },
    ];

    for (const variant of variants) {
        for (const layout of ['legacy', 'section', 'group']) {
            it(`updates ${variant.name} submit buttons in ${layout} layout without changing controls`, () => {
                const fields: IKlesFieldConfig[] = [
                    { name: 'save', component: variant.field, buttonType: 'submit', label: 'Save', icon: 'save' },
                    { name: 'action', component: variant.field, buttonType: 'button', label: 'Action' },
                    { name: 'reset', component: variant.field, buttonType: 'reset', label: 'Reset' },
                    { name: 'disabled', component: variant.field, buttonType: 'submit', label: 'Disabled', disabled: true },
                ];
                const elements: KlesFormElement[] = layout === 'section'
                    ? [{ type: 'section', title: 'Outer', fields: [{ type: 'layoutGroup', fields }] }]
                    : layout === 'group'
                        ? [{ name: 'nested', type: EnumType.group, collections: fields }]
                        : fields;
                const formFixture = createForm(elements);
                const form = formFixture.componentInstance;
                const control = form.form.get(layout === 'group' ? 'nested.save' : 'save')!;
                control.markAsDirty();
                control.markAsTouched();
                const value = form.form.getRawValue();
                const buttons = () => Array.from(formFixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
                expect(form.submitting()).toBeFalse();
                expect(buttons().map((button) => button.disabled)).toEqual([false, false, false, true]);
                expect(formFixture.nativeElement.querySelector('mat-spinner')).toBeNull();

                formFixture.componentRef.setInput('submitting', true);
                formFixture.detectChanges();
                expect(buttons().map((button) => button.disabled)).toEqual([true, false, false, true]);
                expect(formFixture.nativeElement.querySelectorAll('mat-spinner').length).toBe(2);
                expect(buttons()[0].getAttribute('aria-busy')).toBe('true');
                expect(formFixture.nativeElement.querySelector('form').getAttribute('aria-busy')).toBe('true');
                if (variant.name !== 'icon') expect(buttons()[0].textContent).toContain('Save');
                else expect(buttons()[0].getAttribute('aria-label')).toBe('Save');
                expect(control.enabled).toBeTrue();
                expect(form.form.getRawValue()).toEqual(value);
                expect(form.form.valid).toBeTrue();

                // A programmatic disabled state applied during a save must survive it.
                control.disable();
                formFixture.componentRef.setInput('submitting', false);
                formFixture.detectChanges();
                expect(buttons().map((button) => button.disabled)).toEqual([true, false, false, true]);
                expect(formFixture.nativeElement.querySelector('mat-spinner')).toBeNull();
                expect(formFixture.nativeElement.querySelector('form').hasAttribute('aria-busy')).toBeFalse();
                expect(control.dirty && control.touched).toBeTrue();
                control.enable();
                formFixture.detectChanges();
                expect(buttons()[0].disabled).toBeFalse();
                expect(buttons()[0].querySelector('mat-icon')?.textContent).toContain('save');
            });
        }

        it(`supports explicit loading on a standalone ${variant.name} button`, () => {
            TestBed.configureTestingModule({ imports: [variant.control, NoopAnimationsModule] });
            const buttonFixture = TestBed.createComponent(variant.control);
            fixture = buttonFixture;
            buttonFixture.componentRef.setInput('label', 'Save');
            buttonFixture.detectChanges();
            const button = buttonFixture.nativeElement.querySelector('button') as HTMLButtonElement;
            expect(button.disabled).toBeFalse();
            buttonFixture.componentRef.setInput('loading', true);
            buttonFixture.detectChanges();
            expect(button.disabled).toBeTrue();
            expect(button.querySelector('mat-spinner')).not.toBeNull();
            buttonFixture.componentRef.setInput('loading', false);
            buttonFixture.detectChanges();
            expect(button.disabled).toBeFalse();
            expect(button.querySelector('mat-spinner')).toBeNull();
        });
    }

    it('blocks native and programmatic submit events while saving and resumes afterwards', () => {
        const formFixture = createForm([{ name: 'save', component: KlesFormButtonComponent, buttonType: 'submit' }]);
        const component = formFixture.componentInstance;
        const submitted = spyOn(component.submit, 'emit');
        const nativeForm = formFixture.nativeElement.querySelector('form') as HTMLFormElement;
        nativeForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        expect(submitted).toHaveBeenCalledTimes(1);
        formFixture.componentRef.setInput('submitting', true);
        formFixture.detectChanges();
        const event = new Event('submit', { bubbles: true, cancelable: true });
        nativeForm.dispatchEvent(event);
        component.onSubmit(new Event('submit', { cancelable: true }));
        expect(event.defaultPrevented).toBeTrue();
        expect(submitted).toHaveBeenCalledTimes(1);
        formFixture.componentRef.setInput('submitting', false);
        formFixture.detectChanges();
        nativeForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        expect(submitted).toHaveBeenCalledTimes(2);
    });

    it('uses the effective button type from uiButton and reacts to runtime changes', () => {
        const formFixture = createForm([{
            name: 'save', component: KlesFormButtonComponent, buttonType: 'button',
            value: { uiButton: { type: 'submit', label: 'Save' } },
        }]);
        formFixture.componentRef.setInput('submitting', true);
        formFixture.detectChanges();
        const button = formFixture.nativeElement.querySelector('button') as HTMLButtonElement;
        expect(button.disabled).toBeTrue();
        formFixture.componentInstance.form.get('save')!.setValue({ uiButton: { type: 'button' } });
        formFixture.detectChanges();
        expect(button.disabled).toBeFalse();
        expect(button.querySelector('mat-spinner')).toBeNull();
    });

    it('applies the current submission state to newly mounted buttons', () => {
        const formFixture = createForm([]);
        formFixture.componentRef.setInput('submitting', true);
        formFixture.detectChanges();
        formFixture.componentRef.setInput('fields', [{ name: 'save', component: KlesFormButtonComponent, buttonType: 'submit' }]);
        formFixture.detectChanges();
        expect(formFixture.nativeElement.querySelector('button').disabled).toBeTrue();
        expect(formFixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
    });

    it('accepts a parent signal and keeps separate forms independent', () => {
        TestBed.configureTestingModule({ imports: [SubmissionHost, NoopAnimationsModule] });
        const hostFixture = TestBed.createComponent(SubmissionHost);
        fixture = hostFixture;
        hostFixture.detectChanges();
        const buttons = hostFixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        buttons[0].click();
        hostFixture.detectChanges();
        expect(hostFixture.componentInstance.save).toHaveBeenCalledTimes(1);
        expect(buttons[0].disabled).toBeTrue();
        expect(buttons[1].disabled).toBeFalse();
        buttons[0].click();
        expect(hostFixture.componentInstance.save).toHaveBeenCalledTimes(1);
        hostFixture.componentInstance.saving.set(false);
        hostFixture.detectChanges();
        expect(buttons[0].disabled).toBeFalse();
    });
});
