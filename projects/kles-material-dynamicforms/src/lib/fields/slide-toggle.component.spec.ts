import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FIELD, GROUP, SIBLING_FIELDS } from '../token';
import { KlesFormSlideToggleComponent } from './slide-toggle.component';

describe('KlesFormSlideToggleComponent', () => {
    function setup(hint?: string) {
        const field: IKlesFieldConfig = {
            name: 'enabled',
            label: 'Activer la fonctionnalite',
            hint,
        };

        TestBed.configureTestingModule({
            imports: [KlesFormSlideToggleComponent, NoopAnimationsModule],
            providers: [
                { provide: FIELD, useValue: field },
                { provide: GROUP, useValue: new FormGroup({ enabled: new FormControl(false) }) },
                { provide: SIBLING_FIELDS, useValue: [] },
            ],
        });

        const fixture = TestBed.createComponent(KlesFormSlideToggleComponent);
        fixture.detectChanges();
        return fixture;
    }

    it('renders the configured hint', () => {
        const fixture = setup('Ce parametre peut etre modifie plus tard.');

        const hint = fixture.nativeElement.querySelector('.kles-slide-toggle__hint') as HTMLElement;
        expect(hint.textContent).toContain('Ce parametre peut etre modifie plus tard.');
    });

    it('does not render an empty hint container', () => {
        const fixture = setup();

        expect(fixture.nativeElement.querySelector('.kles-slide-toggle__hint')).toBeNull();
    });
});
