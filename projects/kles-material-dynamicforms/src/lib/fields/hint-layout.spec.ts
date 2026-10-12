import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormField } from '@angular/material/form-field';
import { IKlesFieldConfig, IKlesFieldUi } from '../interfaces/field.config.interface';
import { FIELD, GROUP, GROUP_UI, SIBLING_FIELDS } from '../token';
import { ControlUiState } from '../ui/ui-state/control-ui-state';
import { GroupUiState } from '../ui/ui-state/group-ui-state';
import { KlesFieldAbstract } from './field.abstract';
import { KlesFormColorComponent } from './color.component';
import { KlesFormInputComponent } from './input.component';

const longHint = 'Choisir une couleur active le mode personnalise. Ce texte doit rester entierement visible sans chevaucher le champ suivant.';

for (const component of [KlesFormColorComponent, KlesFormInputComponent] as Type<KlesFieldAbstract>[]) {
    describe(`${component.name} hint layout`, () => {
        let fixture: ComponentFixture<KlesFieldAbstract>;

        function setup(overrides: Partial<IKlesFieldConfig> = {}) {
            const field: IKlesFieldConfig = { name: 'value', label: 'Couleur', ...overrides };
            const state = new ControlUiState<IKlesFieldUi>({});
            TestBed.configureTestingModule({
                imports: [component, NoopAnimationsModule],
                providers: [
                    { provide: FIELD, useValue: field },
                    { provide: GROUP, useValue: new FormGroup({ value: new FormControl('#ffffff') }) },
                    { provide: GROUP_UI, useValue: new GroupUiState({ value: state }) },
                    { provide: SIBLING_FIELDS, useValue: [] },
                ],
            });
            fixture = TestBed.createComponent(component);
            fixture.detectChanges();
            const formField = fixture.debugElement.query(By.directive(MatFormField)).componentInstance as MatFormField;
            return { state, formField };
        }

        afterEach(() => {
            fixture?.destroy();
            fixture?.nativeElement.remove();
        });

        it('reserves enough height for a multiline hint', async () => {
            const { formField } = setup({ hint: longHint });
            const host = fixture.nativeElement as HTMLElement;
            host.style.display = 'block';
            host.style.width = '180px';
            document.body.appendChild(host);
            await fixture.whenStable();
            fixture.detectChanges();

            const hint = host.querySelector('mat-hint') as HTMLElement;
            hint.style.fontSize = '12px';
            hint.style.lineHeight = '16px';
            const hintBounds = hint.getBoundingClientRect();
            const fieldBounds = host.querySelector('mat-form-field')!.getBoundingClientRect();

            expect(formField.subscriptSizing).toBe('dynamic');
            expect(hintBounds.height).toBeGreaterThan(16);
            expect(fieldBounds.bottom).toBeGreaterThanOrEqual(hintBounds.bottom);
        });

        it('adapts when the hint is added or removed through the UI state', () => {
            const { state, formField } = setup();
            expect(formField.subscriptSizing).toBe('fixed');

            state.patchValue({ hint: longHint });
            fixture.detectChanges();
            expect(formField.subscriptSizing).toBe('dynamic');

            state.patchValue({ hint: '' });
            fixture.detectChanges();
            expect(formField.subscriptSizing).toBe('fixed');
        });

        it('preserves an explicit fixed sizing configuration', () => {
            const { formField } = setup({ hint: longHint, subscriptSizing: 'fixed' });
            expect(formField.subscriptSizing).toBe('fixed');
        });
    });
}
