import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { delay, of, Subject } from 'rxjs';
import { FIELD, GROUP, SIBLING_FIELDS } from '../token';
import { IKlesFieldConfig, IKlesSelectOptionGroup } from '../interfaces/field.config.interface';
import { KlesFormSelectComponent } from './select.component';

describe('KlesFormSelectComponent', () => {
    function setup(multiple = false, overrides: Partial<IKlesFieldConfig> = {}, open = true) {
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
        if (open) {
            select.open();
        }
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

    it('renders group labels and disables groups and individual options without changing values', fakeAsync(() => {
        const paris = { label: 'Paris' };
        const madrid = { label: 'Madrid', disabled: true };
        const tokyo = { label: 'Tokyo' };
        const { fixture, select } = setup(false, {
            search: false,
            property: 'label',
            optionGroups: [
                { label: 'Europe', options: [paris, madrid] },
                { label: 'Asie', disabled: true, options: [tokyo] },
            ],
        });

        expect(select.optionGroups.map((optionGroup) => optionGroup.label)).toEqual(['Europe', 'Asie']);
        expect(select.options.map((option) => option.disabled)).toEqual([false, true, true]);
        select.options.first._selectViaInteraction();
        expect(fixture.componentInstance.group.controls['value'].value).toBe(paris);
    }));

    it('selects and clears only enabled visible options while keeping disabled selections', fakeAsync(() => {
        const { fixture } = setup(true, {
            search: false,
            optionGroups: [
                { label: 'Actif', options: [1, 2, { label: 'Disabled', disabled: true }] },
                { label: 'Inactif', disabled: true, options: [3, 4] },
            ],
        });
        const component = fixture.componentInstance;
        const control = component.group.controls['value'];
        control.setValue([3]);
        component.toggleVisibleOptions({ checked: true });
        expect(control.value).toEqual([3, 1, 2]);
        expect(component.selectAllControl.value).toBeTrue();
        component.toggleVisibleOptions({ checked: false });
        expect(control.value).toEqual([3]);
        expect(component.selectAllControl.value).toBeFalse();
        control.setValue([1]);
        expect(component.selectAllIndeterminate()).toBeTrue();
    }));

    it('filters within groups, hides empty groups and preserves selections outside search results', fakeAsync(() => {
        const { fixture, select } = setup(true, {
            optionGroups: [
                { label: 'Europe', options: ['Paris', 'Madrid'] },
                { label: 'Asie', options: ['Tokyo'] },
                { label: 'Vide', options: [] },
            ],
        });
        const component = fixture.componentInstance;
        component.group.controls['value'].setValue(['Tokyo']);
        component.searchControl.setValue('par');
        tick();
        fixture.detectChanges();
        expect(select.optionGroups.map((optionGroup) => optionGroup.label)).toEqual(['Europe']);
        component.toggleVisibleOptions({ checked: true });
        expect(component.group.controls['value'].value).toEqual(['Tokyo', 'Paris']);
        expect(component.getHiddenSelectedOptions()).toEqual(['Tokyo']);
        expect(select.triggerValue).toContain('Tokyo');
        component.searchControl.setValue('');
        tick();
        fixture.detectChanges();
        expect(select.optionGroups.map((optionGroup) => optionGroup.label)).toEqual(['Europe', 'Asie']);
        expect(component.filteredOptions()).toEqual(['Paris', 'Madrid', 'Tokyo']);
    }));

    it('updates grouped options from a Subject and gives them precedence over flat options', fakeAsync(() => {
        const groups$ = new Subject<IKlesSelectOptionGroup[]>();
        const { fixture, select } = setup(false, { search: false, optionGroups: groups$ });
        const component = fixture.componentInstance;
        expect(component.isLoading()).toBeTrue();
        groups$.next([{ label: 'Initial', options: ['A'] }]);
        fixture.detectChanges();
        expect(component.isLoading()).toBeFalse();
        expect(select.options.map((option) => option.value)).toEqual(['A']);
        groups$.next([{ label: 'Updated', disabled: true, options: ['B'] }]);
        fixture.detectChanges();
        expect(select.optionGroups.first.label).toBe('Updated');
        expect(select.options.first.disabled).toBeTrue();
        expect(component.filteredOptions()).toEqual(['B']);
    }));

    it('loads lazy groups on opening and filters locally while the request is pending', fakeAsync(() => {
        const provider = jasmine.createSpy('groupProvider').and.returnValue(
            of([{ label: 'Europe', options: ['Paris', 'Madrid'] }]).pipe(delay(100)),
        );
        const { fixture, select } = setup(false, { lazy: true, optionGroups: provider }, false);
        const component = fixture.componentInstance;
        expect(provider).not.toHaveBeenCalled();
        select.open();
        fixture.detectChanges();
        tick();
        expect(provider).toHaveBeenCalledTimes(1);
        component.searchControl.setValue('par');
        tick(1);
        tick(100);
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual(['Paris']);
        expect(component.filteredOptionGroups()[0].label).toBe('Europe');
        expect(provider).toHaveBeenCalledTimes(1);
    }));

    it('passes remote searches and form values to the grouped provider and restores baseline groups', fakeAsync(() => {
        const baseline = [{ label: 'Europe', options: ['Paris'] }];
        const results = [{ label: 'Asie', disabled: true, options: ['Tokyo'] }];
        const provider = jasmine.createSpy('groupProvider').and.callFake((search?: string) => of(search ? results : baseline));
        const { fixture } = setup(false, {
            optionGroups: provider,
            search: { mode: 'remote', minLength: 3 },
        });
        const component = fixture.componentInstance;
        expect(component.filteredOptions()).toEqual(['Paris']);
        component.searchControl.setValue('to');
        tick();
        expect(provider).toHaveBeenCalledTimes(1);
        component.searchControl.setValue('tok');
        tick();
        fixture.detectChanges();
        expect(provider).toHaveBeenCalledWith('tok', { value: null });
        expect(component.filteredOptions()).toEqual(['Tokyo']);
        expect(component.filteredOptionGroups()[0].disabled).toBeTrue();
        component.searchControl.setValue('');
        tick();
        fixture.detectChanges();
        expect(component.filteredOptions()).toEqual(['Paris']);
        expect(component.filteredOptionGroups()[0].label).toBe('Europe');
    }));

    it('preserves the selected value across closing and reopening a lazy grouped select', fakeAsync(() => {
        const { fixture, select } = setup(false, {
            search: false,
            lazy: true,
            optionGroups: () => of([{ label: 'Europe', options: ['Paris'] }]),
        });
        fixture.componentInstance.group.controls['value'].setValue('Paris');
        select.close();
        fixture.detectChanges();
        expect(select.triggerValue).toBe('Paris');
        select.open();
        fixture.detectChanges();
        expect(select.optionGroups.first.label).toBe('Europe');
        expect(select.triggerValue).toBe('Paris');
    }));

    it('renders groups without virtual scrolling even when virtualScroll is requested', fakeAsync(() => {
        const { fixture, select } = setup(false, {
            search: false,
            virtualScroll: true,
            optionGroups: [{ label: 'Europe', options: ['Paris'] }],
        });
        expect(select.optionGroups.length).toBe(1);
        expect(fixture.componentInstance.isVirtualScrollEnabled()).toBeFalse();
        expect(fixture.componentInstance.panelClasses()).not.toContain('kles-select-virtual-panel');
        expect(select.panel.nativeElement.querySelector('cdk-virtual-scroll-viewport')).toBeNull();
        fixture.componentInstance.group.controls['value'].setValue('Paris');
        expect(fixture.componentInstance.getHiddenSelectedOptions()).toEqual([]);
    }));

    it('prevents keyboard selection in disabled groups and allows selection in enabled groups', fakeAsync(() => {
        const { fixture, select } = setup(false, {
            optionGroups: [
                { label: 'Europe', options: ['Paris'] },
                { label: 'Asie', disabled: true, options: ['Tokyo', 'Osaka'] },
                { label: 'Afrique', options: ['Dakar'] },
            ],
        });
        const internals = select as unknown as { _keyManager: { setActiveItem(index: number): void; activeItemIndex: number | null } };
        internals._keyManager.setActiveItem(1);
        const panel = select.panel.nativeElement as HTMLElement;
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
        Object.defineProperty(downEvent, 'keyCode', { value: 40 });
        panel.dispatchEvent(downEvent);
        tick(20);
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        Object.defineProperty(enterEvent, 'keyCode', { value: 13 });
        panel.dispatchEvent(enterEvent);
        tick();
        expect(fixture.componentInstance.group.controls['value'].value).toBeNull();
        expect(select.panelOpen).toBeTrue();
        const endEvent = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
        Object.defineProperty(endEvent, 'keyCode', { value: 35 });
        panel.dispatchEvent(endEvent);
        tick();
        panel.dispatchEvent(enterEvent);
        tick();
        expect(fixture.componentInstance.group.controls['value'].value).toBe('Dakar');
    }));
});
