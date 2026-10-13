import { TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicFieldsDemoComponent } from './dynamic-fields-demo.component';
import { Observable, defer } from 'rxjs';

describe('DynamicFieldsDemoComponent', () => {
    const createDemo = async () => {
        TestBed.configureTestingModule({
            imports: [DynamicFieldsDemoComponent, NoopAnimationsModule],
            providers: [provideZoneChangeDetection()],
        });
        const fixture = TestBed.createComponent(DynamicFieldsDemoComponent);
        // Observe real subscriptions/resolutions independently of optional preview counters.
        const optionLoads = jasmine.createSpy('optionLoads');
        const definitionLoads = jasmine.createSpy('definitionLoads');
        const select = fixture.componentInstance.fields().find((field) => 'name' in field && field.name === 'typeDossier')!;
        if ('options' in select) {
            const source = select.options as Observable<any[]>;
            select.options = defer(() => { optionLoads(); return source; });
        }
        const slot = fixture.componentInstance.fields().find((field) => field.type === 'dynamicFields' && field.resolveFields)!;
        if (slot.type === 'dynamicFields') {
            const resolver = slot.resolveFields!;
            slot.resolveFields = (event) => {
                if (event.values['typeDossier'] !== 'Aucun') definitionLoads();
                return resolver(event);
            };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        return Object.assign(fixture, { optionLoads, definitionLoads });
    };

    it('renders resolved fields below the select and preserves common controls and values', async () => {
        const fixture = await createDemo();
        const demo = fixture.componentInstance;
        const form = demo.dynamicForm.form;
        const applicant = form.get('demandeur')!;
        fixture.ngZone!.run(() => {
            applicant.setValue('Alice');
            form.get('typeDossier')!.setValue('Particulier');
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(demo.resolution()?.status).toBe('ready');
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['emailContact', 'ville']);
        expect(form.get('emailContact')).not.toBeNull();
        expect(form.get('ville')).not.toBeNull();
        expect(form.get('emailContact')!.hasError('required')).toBeTrue();
        form.get('emailContact')!.setValue('alice@example.com');
        expect(form.getRawValue().emailContact).toBe('alice@example.com');
        const labels = Array.from(fixture.nativeElement.querySelectorAll('mat-label') as NodeListOf<Element>).map((node) => node.textContent?.trim());
        expect(labels).toEqual(['Nom du demandeur', 'Type de dossier', 'Email de contact', 'Ville', 'Référence', 'Réponse']);
        expect(demo.dynamicForm.usesAdvancedLayout).toBeFalse();
        expect(fixture.nativeElement.querySelector('.kles-form-layout-group, .kles-layout-grid, .kles-layout-item')).toBeNull();
        expect(fixture.nativeElement.querySelector('.resolved-fields').textContent).toContain('Email de contact');
        expect(fixture.optionLoads).toHaveBeenCalledTimes(1);
        fixture.ngZone!.run(() => form.get('typeDossier')!.setValue('Entreprise'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(form.get('emailContact')).toBeNull();
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['raisonSociale', 'siret']);
        expect(form.get('raisonSociale')).not.toBeNull();
        expect(form.get('ville')).toBeNull();
        expect(form.getRawValue().emailContact).toBeUndefined();
        expect(form.get('demandeur')).toBe(applicant);
        expect(applicant.value).toBe('Alice');
        expect(fixture.optionLoads).toHaveBeenCalledTimes(1);
        fixture.ngZone!.run(() => form.get('typeDossier')!.setValue('Aucun'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(form.get('raisonSociale')).toBeNull();
        expect(demo.resolvedFields()).toEqual([]);
        expect(demo.controlNames()).toEqual(['demandeur', 'typeDossier', 'reference', 'reponse']);
        expect(demo.values()['demandeur']).toBe('Alice');
    });

    it('keeps only the last requested dossier without resolving again for manual field updates', async () => {
        const fixture = await createDemo();
        const demo = fixture.componentInstance;
        const form = demo.dynamicForm.form;
        fixture.ngZone!.run(() => {
            form.get('typeDossier')!.setValue('Particulier');
            form.get('typeDossier')!.setValue('Entreprise');
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(form.get('emailContact')).toBeNull();
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['raisonSociale', 'siret']);
        expect(form.get('raisonSociale')).not.toBeNull();
        expect(fixture.definitionLoads).toHaveBeenCalledTimes(2);
        demo.addExtraField();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(form.get('complement1')).not.toBeNull();
        demo.removeExtraFields();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(form.get('complement1')).toBeNull();
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['raisonSociale', 'siret']);
        expect(form.get('raisonSociale')).not.toBeNull();
        expect(fixture.definitionLoads).toHaveBeenCalledTimes(2);
        expect(fixture.optionLoads).toHaveBeenCalledTimes(1);
    });

    it('shows resolver errors, retains the last result and retries after another selection', async () => {
        spyOn(console, 'warn');
        const fixture = await createDemo();
        const demo = fixture.componentInstance;
        const selection = demo.dynamicForm.form.get('typeDossier')!;
        fixture.ngZone!.run(() => selection.setValue('Entreprise'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const company = demo.dynamicForm.form.get('raisonSociale')!;
        company.setValue('Entreprise test');
        fixture.ngZone!.run(() => selection.setValue('Erreur simulée'));
        fixture.detectChanges();
        expect(demo.loading()).toBeTrue();
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['raisonSociale', 'siret']);
        expect(demo.dynamicForm.form.get('raisonSociale')).toBe(company);
        expect(company.value).toBe('Entreprise test');
        await fixture.whenStable();
        fixture.detectChanges();
        expect(demo.resolution()?.status).toBe('error');
        expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Choisissez un autre type pour réessayer');
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['raisonSociale', 'siret']);
        fixture.ngZone!.run(() => selection.setValue('Particulier'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(demo.resolution()?.status).toBe('ready');
        expect(demo.resolution()?.diagnostic).toBeUndefined();
        expect(demo.resolvedFields().map((field) => field.name)).toEqual(['emailContact', 'ville']);
        expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
        expect(fixture.optionLoads).toHaveBeenCalledTimes(1);
    });

    it('changes required and disabled flags while preserving the reference control and value', async () => {
        const fixture = await createDemo();
        const demo = fixture.componentInstance;
        const reference = demo.dynamicForm.form.get('reference')!;
        demo.toggleRequired();
        fixture.detectChanges();
        expect(reference.hasError('required')).toBeTrue();
        reference.setValue('REF-42');
        demo.toggleDisabled();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(reference.disabled).toBeTrue();
        expect(demo.values()['reference']).toBe('REF-42');
        demo.toggleDisabled();
        demo.toggleRequired();
        fixture.detectChanges();
        expect(demo.dynamicForm.form.get('reference')).toBe(reference);
        expect(reference.enabled).toBeTrue();
        expect(reference.value).toBe('REF-42');
        expect(reference.valid).toBeTrue();
    });

    it('reinitializes only the answer when its component type changes', async () => {
        const fixture = await createDemo();
        const demo = fixture.componentInstance;
        const form = demo.dynamicForm.form;
        const previous = form.get('reponse');
        form.get('demandeur')!.setValue('Alice');
        form.get('reponse')!.setValue('Edited answer');
        demo.toggleAnswerType();
        fixture.detectChanges();
        expect(form.get('reponse')).not.toBe(previous);
        expect(form.get('reponse')!.value).toBeTrue();
        expect(form.get('demandeur')!.value).toBe('Alice');
        expect(fixture.nativeElement.querySelector('mat-checkbox')).not.toBeNull();
        demo.toggleAnswerType();
        fixture.detectChanges();
        expect(form.get('reponse')!.value).toBe('Réponse initiale');
    });
});
