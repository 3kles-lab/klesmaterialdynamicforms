import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { delay, of } from 'rxjs';
import { FIELD, GROUP, SIBLING_FIELDS } from '../token';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFormSelectComponent } from './select.component';

describe('KlesFormSelectComponent keyboard scrolling', () => {
    function setup(multiple = false, overrides: Partial<IKlesFieldConfig> = {}) {
        const field: IKlesFieldConfig = {
            name: 'value',
            search: true,
            multiple,
            options: Array.from({ length: 100 }, (_, index) => index),
            ...overrides,
        };
        const group = new FormGroup({ value: new FormControl(multiple ? [] : null) });

        TestBed.configureTestingModule({
            imports: [KlesFormSelectComponent, NoopAnimationsModule],
            providers: [
                { provide: FIELD, useValue: field },
                { provide: GROUP, useValue: group },
                { provide: SIBLING_FIELDS, useValue: [] },
            ],
        });

        const fixture = TestBed.createComponent(KlesFormSelectComponent);
        fixture.detectChanges();
        const select = fixture.debugElement.query(By.directive(MatSelect)).componentInstance as MatSelect;
        select.open();
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        return { fixture, select };
    }

    it('returns the panel to the top when Home activates the first option', fakeAsync(() => {
        const { select } = setup();
        const internals = select as unknown as { _keyManager: { setActiveItem(index: number): void; activeItemIndex: number | null } };
        internals._keyManager.setActiveItem(50);
        tick(20);

        const panel = select.panel.nativeElement as HTMLElement;
        expect(panel.scrollTop).toBeGreaterThan(0);
        expect(select.options.first.disabled).toBeTrue();

        const homeEvent = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
        Object.defineProperty(homeEvent, 'keyCode', { value: 36 });
        panel.dispatchEvent(homeEvent);
        tick(20);

        expect(internals._keyManager.activeItemIndex).toBe(1);
        expect(panel.scrollTop).toBe(0);
    }));

    it('does not let PageUp activate the internal search option', fakeAsync(() => {
        const { select } = setup();
        const internals = select as unknown as { _keyManager: { setActiveItem(index: number): void; activeItemIndex: number | null } };
        internals._keyManager.setActiveItem(10);
        tick(20);

        const panel = select.panel.nativeElement as HTMLElement;
        const pageUpEvent = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true });
        Object.defineProperty(pageUpEvent, 'keyCode', { value: 33 });
        panel.dispatchEvent(pageUpEvent);
        tick(20);

        expect(internals._keyManager.activeItemIndex).toBe(1);
        expect(panel.scrollTop).toBe(0);
    }));

    it('keeps a lazy local request alive when searching before it responds', fakeAsync(() => {
        const options = Array.from({ length: 100 }, (_, index) => index);
        const { fixture } = setup(false, { lazy: true, options: of(options).pipe(delay(100)) });
        const component = fixture.componentInstance;

        expect(component.isLoading()).toBeTrue();
        component.searchControl.setValue('9');
        tick(1);
        expect(component.isLoading()).toBeTrue();

        tick(100);
        fixture.detectChanges();
        expect(component.isLoading()).toBeFalse();
        expect(component.filteredOptions()).toEqual([9, 19, 29, 39, 49, 59, 69, 79, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
    }));

    it('keeps the current options below minLength and restores them when search is cleared', fakeAsync(() => {
        const options = [0, 1, 2, 3];
        const optionsProvider = jasmine.createSpy('optionsProvider').and.callFake((search?: string) =>
            of(search ? options.filter((option) => String(option).includes(search)) : options),
        );
        const { fixture } = setup(false, {
            options: optionsProvider,
            search: { mode: 'remote', minLength: 3 },
        });
        const component = fixture.componentInstance;

        expect(component.filteredOptions()).toEqual(options);

        component.searchControl.setValue('12');
        tick();
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual(options);
        expect(optionsProvider).not.toHaveBeenCalledWith('12', jasmine.anything());

        component.searchControl.setValue('123');
        tick();
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual([]);

        component.searchControl.setValue('12');
        tick();
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual(options);

        component.searchControl.setValue('');
        tick();
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual(options);
    }));
});
