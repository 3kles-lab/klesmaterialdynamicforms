import { TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { OverlayContainer } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { FIELD, FIELD_CONTEXT, GROUP, SIBLING_FIELDS } from '../token';
import { KlesActionMenuFieldConfig, KlesActionMenuItem, KlesFormActionMenuComponent } from './action-menu.component';

interface MenuContext {
    enabled: boolean;
    extra: boolean;
}

describe('KlesFormActionMenuComponent', () => {
    let fixture: ComponentFixture<KlesFormActionMenuComponent<MenuContext>>;

    async function setup(options: KlesActionMenuFieldConfig<MenuContext>['options']) {
        const context = signal<MenuContext>({ enabled: false, extra: false });
        const onAction = jasmine.createSpy('onAction');
        const field: KlesActionMenuFieldConfig<MenuContext> = {
            name: 'actions',
            id: 'test-actions',
            label: 'Actions',
            options,
            onAction,
        };
        const group = new FormGroup({ actions: new FormControl(null), reference: new FormControl('form-value') });

        TestBed.configureTestingModule({
            imports: [KlesFormActionMenuComponent, NoopAnimationsModule],
            providers: [
                { provide: FIELD, useValue: field },
                { provide: GROUP, useValue: group },
                { provide: SIBLING_FIELDS, useValue: [] },
                { provide: FIELD_CONTEXT, useValue: context },
            ],
        });

        fixture = TestBed.createComponent<KlesFormActionMenuComponent<MenuContext>>(KlesFormActionMenuComponent);
        fixture.detectChanges();
        const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatMenuHarness.with({ selector: '#test-actions' }));
        return { menu, context, onAction, field, group };
    }

    afterEach(() => {
        fixture?.destroy();
        TestBed.inject(OverlayContainer).ngOnDestroy();
    });

    function waitForPanelRemoval(panel: HTMLElement): Promise<void> {
        if (!panel.isConnected) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                if (!panel.isConnected) {
                    observer.disconnect();
                    clearTimeout(timeout);
                    resolve();
                }
            });
            const timeout = setTimeout(() => {
                observer.disconnect();
                reject(new Error('Material did not detach the closed menu panel'));
            }, 1000);
            observer.observe(TestBed.inject(OverlayContainer).getContainerElement(), { childList: true, subtree: true });
        });
    }

    it('preserves flat actions and their original event payload', async () => {
        const leaf: KlesActionMenuItem<MenuContext> = { id: 'download', label: 'Download' };
        const { menu, onAction, context, field, group } = await setup([leaf]);

        await menu.clickItem({ text: 'Download', hasSubmenu: false });

        expect(onAction).toHaveBeenCalledTimes(1);
        const event = onAction.calls.mostRecent().args[0];
        expect(event.actionId).toBe('download');
        expect(event.value).toBe(leaf);
        expect(event.context).toBe(context());
        expect(event.field).toBe(field);
        expect(event.group).toBe(group);
        expect(event.originalEvent).toEqual(jasmine.any(MouseEvent));
        expect(await menu.isOpen()).toBeFalse();
    });

    it('opens three menu levels without dispatching parents and closes the entire chain after selecting a leaf', async () => {
        const leaf: KlesActionMenuItem<MenuContext> = { id: 'csv', label: 'CSV' };
        const { menu, onAction } = await setup([
            { id: 'export', label: 'Export', options: [{ id: 'format', label: 'Format', options: [leaf] }] },
        ]);

        await menu.open();
        const [exportItem] = await menu.getItems({ text: 'Export', hasSubmenu: true });
        const exportMenu = (await exportItem.getSubmenu())!;
        await exportItem.click();
        const [formatItem] = await exportMenu.getItems({ text: 'Format', hasSubmenu: true });
        const formatMenu = (await formatItem.getSubmenu())!;
        await formatItem.click();

        expect(await menu.isOpen()).toBeTrue();
        expect(await exportMenu.isOpen()).toBeTrue();
        expect(await formatMenu.isOpen()).toBeTrue();
        expect(onAction).not.toHaveBeenCalled();

        await formatMenu.clickItem({ text: 'CSV', hasSubmenu: false });

        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.calls.mostRecent().args[0].value).toBe(leaf);
        expect(await formatMenu.isOpen()).toBeFalse();
        expect(await exportMenu.isOpen()).toBeFalse();
        expect(await menu.isOpen()).toBeFalse();
    });

    it('uses Material keyboard navigation and returns focus when closing nested menus', async () => {
        const { menu, onAction } = await setup([
            { id: 'export', label: 'Export', options: [{ id: 'format', label: 'Format', options: [{ id: 'csv', label: 'CSV' }] }] },
        ]);
        await menu.open();
        const [exportItem] = await menu.getItems({ text: 'Export' });
        const exportMenu = (await exportItem.getSubmenu())!;
        await exportItem.focus();
        await (await exportItem.host()).sendKeys(TestKey.RIGHT_ARROW);

        expect(await exportMenu.isOpen()).toBeTrue();
        const [formatItem] = await exportMenu.getItems({ text: 'Format' });
        expect(await formatItem.isFocused()).toBeTrue();
        const formatMenu = (await formatItem.getSubmenu())!;
        await (await formatItem.host()).sendKeys(TestKey.RIGHT_ARROW);

        expect(await formatMenu.isOpen()).toBeTrue();
        const formatPanel = document.getElementById((await (await formatItem.host()).getAttribute('aria-controls'))!)!;
        const [csvItem] = await formatMenu.getItems({ text: 'CSV' });
        expect(await csvItem.isFocused()).toBeTrue();
        await (await csvItem.host()).sendKeys(TestKey.LEFT_ARROW);
        // NoopAnimations still detaches overlays asynchronously; wait before routing the next key.
        await waitForPanelRemoval(formatPanel);

        expect(await formatMenu.isOpen()).toBeFalse();
        expect(await exportMenu.isOpen()).toBeTrue();
        expect(await formatItem.isFocused()).toBeTrue();
        const exportPanel = document.getElementById((await (await exportItem.host()).getAttribute('aria-controls'))!)!;
        await (await formatItem.host()).sendKeys(TestKey.ESCAPE);
        await waitForPanelRemoval(exportPanel);

        expect(await exportMenu.isOpen()).toBeFalse();
        expect(await menu.isOpen()).toBeTrue();
        expect(await exportItem.isFocused()).toBeTrue();
        const rootPanel = document.getElementById((await (await menu.host()).getAttribute('aria-controls'))!)!;
        await (await exportItem.host()).sendKeys(TestKey.ESCAPE);
        await waitForPanelRemoval(rootPanel);

        expect(await menu.isOpen()).toBeFalse();
        expect(await menu.isFocused()).toBeTrue();
        expect(onAction).not.toHaveBeenCalled();
    });

    it('keeps icons in the Material icon slot at nested levels', async () => {
        const { menu } = await setup([
            { id: 'parent', label: 'Parent', options: [{ id: 'leaf', label: 'Leaf', icon: 'download' }] },
        ]);
        await menu.open();
        const [parentItem] = await menu.getItems({ text: 'Parent' });
        await parentItem.click();
        const childMenu = (await parentItem.getSubmenu())!;
        const [leafItem] = await childMenu.getItems({ text: /Leaf/ });
        const panelId = await (await parentItem.host()).getAttribute('aria-controls');
        const leafButton = document.querySelector(`#${panelId} button[role="menuitem"]`)!;

        expect(leafButton.querySelector(':scope > mat-icon')?.textContent).toContain('download');
        expect(leafButton.querySelector('.mat-mdc-menu-item-text mat-icon')).toBeNull();
        expect(await leafItem.hasSubmenu()).toBeFalse();
    });

    it('reevaluates visibility and disabled conditions at each depth when the context changes', async () => {
        const disabledCondition = jasmine.createSpy('disabledCondition').and.callFake((value: MenuContext | null) => !value?.enabled);
        const { menu, context, field, group, onAction } = await setup([
            { id: 'hidden-root', label: 'Hidden root', visible: false },
            { id: 'disabled-root', label: 'Disabled root', disabled: true },
            { id: 'conditional-root', label: 'Conditional root', visible: (value) => value?.extra === true },
            {
                id: 'group', label: 'Group', options: [
                    { id: 'hidden-child', label: 'Hidden child', visible: false },
                    { id: 'locked', label: 'Locked', disabled: disabledCondition },
                    {
                        id: 'extra', label: 'Extra', options: [
                            { id: 'deep', label: 'Deep action', visible: (value) => value?.extra === true },
                        ],
                    },
                ],
            },
        ]);

        await menu.open();
        expect(await menu.getItems({ text: 'Hidden root' })).toHaveSize(0);
        expect(await menu.getItems({ text: 'Conditional root' })).toHaveSize(0);
        const [disabledRoot] = await menu.getItems({ text: 'Disabled root' });
        expect(await disabledRoot.isDisabled()).toBeTrue();
        await disabledRoot.click();
        expect(onAction).not.toHaveBeenCalled();

        const [groupItem] = await menu.getItems({ text: 'Group' });
        const groupMenu = (await groupItem.getSubmenu())!;
        await groupItem.click();
        expect(await groupMenu.getItems({ text: 'Hidden child' })).toHaveSize(0);
        const [lockedItem] = await groupMenu.getItems({ text: 'Locked' });
        const [extraItem] = await groupMenu.getItems({ text: 'Extra' });
        expect(await lockedItem.isDisabled()).toBeTrue();
        expect(await extraItem.isDisabled()).toBeTrue();
        expect(disabledCondition).toHaveBeenCalledWith(context(), field, group);
        await lockedItem.click();
        expect(onAction).not.toHaveBeenCalled();

        context.set({ enabled: true, extra: true });
        fixture.detectChanges();

        expect(await menu.getItems({ text: 'Conditional root' })).toHaveSize(1);
        expect(await lockedItem.isDisabled()).toBeFalse();
        expect(await extraItem.isDisabled()).toBeFalse();
        const extraMenu = (await extraItem.getSubmenu())!;
        await extraItem.click();
        expect(await extraMenu.getItems({ text: 'Deep action' })).toHaveSize(1);
        await extraMenu.clickItem({ text: 'Deep action' });
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.calls.mostRecent().args[0].context).toBe(context());
    });

    it('reevaluates nested conditions when a sibling form value changes', async () => {
        const { menu, group, onAction } = await setup([
            {
                id: 'parent', label: 'Parent', options: [
                    { id: 'fallback', label: 'Fallback', disabled: (_context, _field, currentGroup) => currentGroup.controls['reference'].value !== 'ready' },
                    { id: 'conditional', label: 'Conditional', visible: (_context, _field, currentGroup) => currentGroup.controls['reference'].value === 'ready' },
                ],
            },
        ]);
        await menu.open();
        const [parentItem] = await menu.getItems({ text: 'Parent' });
        const childMenu = (await parentItem.getSubmenu())!;
        await parentItem.click();
        const [fallbackItem] = await childMenu.getItems({ text: 'Fallback' });
        expect(await fallbackItem.isDisabled()).toBeTrue();
        expect(await childMenu.getItems({ text: 'Conditional' })).toHaveSize(0);

        group.controls.reference.setValue('ready');
        fixture.detectChanges();

        expect(await fallbackItem.isDisabled()).toBeFalse();
        expect(await childMenu.getItems({ text: 'Conditional' })).toHaveSize(1);
        await childMenu.clickItem({ text: 'Conditional' });
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.calls.mostRecent().args[0].actionId).toBe('conditional');
    });

    it('keeps explicit empty submenus disabled instead of dispatching them as actions', async () => {
        const { menu, onAction } = await setup([{ id: 'empty', label: 'Empty', options: [] }]);
        await menu.open();
        const [emptyItem] = await menu.getItems({ text: 'Empty', hasSubmenu: true });

        expect(await emptyItem.isDisabled()).toBeTrue();
        await emptyItem.click();

        expect(await (await emptyItem.getSubmenu())!.isOpen()).toBeFalse();
        expect(onAction).not.toHaveBeenCalled();
    });

    it('disables the root trigger and open menu items when its form control is disabled', async () => {
        const { menu, group, onAction } = await setup([
            { id: 'parent', label: 'Parent', options: [{ id: 'leaf', label: 'Leaf' }] },
        ]);
        await menu.open();
        const [parentItem] = await menu.getItems({ text: 'Parent' });
        const childMenu = (await parentItem.getSubmenu())!;
        await parentItem.click();
        const [leafItem] = await childMenu.getItems({ text: 'Leaf' });

        group.controls.actions.disable();
        fixture.detectChanges();

        expect(await menu.isDisabled()).toBeTrue();
        expect(await parentItem.isDisabled()).toBeTrue();
        expect(await leafItem.isDisabled()).toBeTrue();
        await leafItem.click();
        expect(onAction).not.toHaveBeenCalled();

        group.controls.actions.enable();
        fixture.detectChanges();
        expect(await menu.isDisabled()).toBeFalse();
        expect(await leafItem.isDisabled()).toBeFalse();
        await leafItem.click();
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('disables already open descendants when their parent condition becomes disabled', async () => {
        const { menu, context, onAction } = await setup([
            {
                id: 'parent', label: 'Parent', disabled: (value) => value?.enabled === true,
                options: [{ id: 'leaf', label: 'Leaf' }],
            },
        ]);
        await menu.open();
        const [parentItem] = await menu.getItems({ text: 'Parent' });
        const childMenu = (await parentItem.getSubmenu())!;
        await parentItem.click();
        const [leafItem] = await childMenu.getItems({ text: 'Leaf' });

        context.set({ enabled: true, extra: false });
        fixture.detectChanges();

        expect(await parentItem.isDisabled()).toBeTrue();
        expect(await leafItem.isDisabled()).toBeTrue();
        await leafItem.click();
        expect(onAction).not.toHaveBeenCalled();

        context.set({ enabled: false, extra: false });
        fixture.detectChanges();
        expect(await leafItem.isDisabled()).toBeFalse();
        await leafItem.click();
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('updates nested options supplied by an observable without dispatching an obsolete action', async () => {
        const options = new Subject<KlesActionMenuItem<MenuContext>[]>();
        const { menu, onAction } = await setup(options);
        await menu.open();
        expect(await menu.getItems()).toHaveSize(0);

        options.next([{ id: 'parent', label: 'Parent', options: [{ id: 'first', label: 'First' }] }]);
        fixture.detectChanges();
        await menu.clickItem({ text: 'Parent' }, { text: 'First' });
        expect(onAction.calls.mostRecent().args[0].actionId).toBe('first');

        options.next([{ id: 'parent', label: 'Parent', options: [{ id: 'second', label: 'Second' }] }]);
        fixture.detectChanges();
        await menu.open();
        const [parentItem] = await menu.getItems({ text: 'Parent' });
        const childMenu = (await parentItem.getSubmenu())!;
        await parentItem.click();
        expect(await childMenu.getItems({ text: 'First' })).toHaveSize(0);
        await childMenu.clickItem({ text: 'Second' });

        expect(onAction).toHaveBeenCalledTimes(2);
        expect(onAction.calls.mostRecent().args[0].actionId).toBe('second');
        options.complete();
    });

    it('retains the function options provider contract for nested menus', async () => {
        const provider = jasmine.createSpy('options').and.returnValue(of([
            { id: 'parent', label: 'Parent', options: [{ id: 'leaf', label: 'Leaf' }] },
        ]));
        const { menu, onAction } = await setup(provider);

        expect(provider).toHaveBeenCalledOnceWith(undefined, { actions: null, reference: 'form-value' });
        await menu.clickItem({ text: 'Parent' }, { text: 'Leaf' });

        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.calls.mostRecent().args[0].actionId).toBe('leaf');
    });
});
