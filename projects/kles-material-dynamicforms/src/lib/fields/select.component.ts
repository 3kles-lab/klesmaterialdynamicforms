import { CommonModule } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { concat, distinctUntilChanged, isObservable, map, Observable, of, shareReplay, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { debounce, startWith } from 'rxjs/operators';
import { FieldMapper } from '../decorators/component.decorator';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { KlesComponentDirective } from '../directive/dynamic-component.directive';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { EnumType } from '../enums/type.enum';

import { KlesTransformPipe } from '../pipe/transform.pipe';
import { KlesFieldAbstract } from './field.abstract';
import { KlesSelectSearchInputComponent } from './select-search-input.component';
import { IKlesSelectSearchOptions } from '../interfaces/field.config.interface';

interface DeferredQuery {
    kind: 'open' | 'search' | 'close';
    value?: string;
}

interface MatSelectInternals {
    _scrollOptionIntoView(index: number): void;
    _keyManager: {
        activeItemIndex: number | null;
        setActiveItem(index: number): void;
    };
}

@FieldMapper({ type: EnumType.select })
@Component({
    selector: 'kles-form-select',
    template: `
        <mat-form-field [subscriptSizing]="field.subscriptSizing ?? 'fixed'" [color]="color()" [formGroup]="group" [appearance]="appearance()">
            @if (label()) {
                <mat-label>{{ label() }}</mat-label>
            }

            <mat-select
                [matTooltip]="tooltip()"
                [attr.id]="field.id"
                [ngClass]="ngClass()"
                [compareWith]="compareFn"
                [panelClass]="panelClasses()"
                [panelWidth]="field.panelWidth || 'auto'"
                [placeholder]="placeholder()"
                [formControlName]="field.name"
                [multiple]="field.multiple"
                (openedChange)="onOpenedChange($event)"
                (focus)="onFocus()"
                (blur)="onBlur()"
            >
                @if (field.triggerComponent) {
                    <mat-select-trigger>
                        <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value" [field]="field" />
                    </mat-select-trigger>
                }

                @if (isSearchEnabled()) {
                    <mat-option>
                        <kles-select-search-input [control]="searchControl" [placeholder]="searchOptions.placeholder || intl.search" [ariaLabel]="searchOptions.ariaLabel || intl.search" [clearAriaLabel]="intl.clearSearch" [searching]="isLoading()" />
                    </mat-option>
                }

                @if (!isLoading()) {
                    @if (field.multiple) {
                        <mat-checkbox class="selectAll mat-mdc-option mdc-list-item" [formControl]="selectAllControl" [indeterminate]="selectAllIndeterminate()" (change)="toggleVisibleOptions($event)">
                            {{ intl.selectAll }}
                        </mat-checkbox>
                    }

                    @if (field.virtualScroll) {
                        <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 48" [style.height.px]="5 * (field.itemSize || 48)">
                            @if (!field.autocompleteComponent) {
                                <mat-option *cdkVirtualFor="let item of filteredOptions()" [value]="item" [disabled]="item?.disabled ?? false">
                                    {{ (field.property ? item[field.property] : item) | klesTransform: field.pipeTransform }}
                                </mat-option>
                            } @else {
                                <mat-option *cdkVirtualFor="let item of filteredOptions()" [value]="item" [disabled]="item?.disabled ?? false">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field" />
                                </mat-option>
                            }
                        </cdk-virtual-scroll-viewport>
                    } @else {
                        @if (!field.autocompleteComponent) {
                            @for (item of filteredOptions(); track item) {
                                <mat-option [value]="item" [disabled]="item?.disabled ?? false">
                                    {{ (field.property ? item[field.property] : item) | klesTransform: field.pipeTransform }}
                                </mat-option>
                            }
                        } @else {
                            @for (item of filteredOptions(); track item) {
                                <mat-option [value]="item" [disabled]="item?.disabled ?? false">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field" />
                                </mat-option>
                            }
                        }
                    }

                    @for (item of getHiddenSelectedOptions(); track item) {
                        <mat-option [value]="item" class="kles-hidden-selected-option">
                            @if (!field.autocompleteComponent) {
                                {{ (field.property ? item[field.property] : item) | klesTransform: field.pipeTransform }}
                            } @else {
                                <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field" />
                            }
                        </mat-option>
                    }
                } @else {
                    <mat-option class="hide-checkbox" disabled>
                        <div class="loadingSelect">{{ intl.loading }}... <mat-spinner class="spinner" diameter="20" /></div>
                    </mat-option>
                }
            </mat-select>

            @if (hint()) {
                <mat-hint>{{ hint() }}</mat-hint>
            }

            @if (field.subComponents || field.clearable || isPending()) {
                <div matSuffix class="suffix">
                    @if (isPending()) {
                        <mat-spinner mode="indeterminate" diameter="21" />
                    }
                    @if (field.subComponents || field.clearable) {
                        <ng-content />
                    }
                </div>
            }

            <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations" />
        </mat-form-field>
    `,
    styles: [
        'kles-form-select mat-form-field {width: 100%;}',
        'kles-form-select .suffix {display: flex; align-items: center;}',
        '.kles-select-panel .loadingSelect {display: flex; flex-direction: row; justify-content: space-between; align-items: center;}',
        '.kles-select-panel .selectAll {padding: 0 16px 0 5px !important; display: flex !important;}',
        '.kles-select-panel .selectAll .mdc-form-field {width: 100%;}',
        '.kles-select-panel .selectAll .mdc-form-field .mdc-label {width: 100%; min-height: 48px; align-items: center; display: flex;}',
        '.kles-select-panel .selectAll .mdc-form-field .mdc-checkbox__ripple {display: none !important;}',
        '.kles-select-panel .kles-hidden-selected-option {display: none !important;}',
        '.kles-select-panel .hide-checkbox .mat-pseudo-checkbox {display: none !important;}',
        '.kles-select-panel:not(.kles-select-virtual-panel) .selectAll {position: sticky; top: -8px; z-index: 1; background: var(--mat-select-panel-background-color, var(--mat-sys-surface-container, white));}',
        '.kles-select-panel.kles-select-has-search:not(.kles-select-virtual-panel) .selectAll {top: 40px;}',
        'div.kles-select-panel.kles-select-virtual-panel {display: flex; flex-direction: column; overflow: hidden;}',
        '.kles-select-panel.kles-select-virtual-panel .kles-select-search-option, .kles-select-panel.kles-select-virtual-panel .selectAll {flex: 0 0 48px;}',
        '.kles-select-panel.kles-select-virtual-panel cdk-virtual-scroll-viewport {flex: 1 1 auto; min-height: 0; width: 100%;}',
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        KlesTransformPipe,
        MatErrorMessageDirective,
        MatProgressSpinner,
        MatHint,
        MatOption,
        KlesComponentDirective,
        ScrollingModule,
        MatSelectTrigger,
        MatSelect,
        MatTooltip,
        MatLabel,
        MatSuffix,
        MatFormField,
        MatCheckbox,
        KlesSelectSearchInputComponent,
    ],
})
export class KlesFormSelectComponent extends KlesFieldAbstract implements OnInit, AfterViewInit, OnDestroy {
    readonly searchControl = new FormControl<string>('');
    readonly selectAllControl = new FormControl(false, { nonNullable: true });
    readonly selectAllIndeterminate = signal(false);
    readonly isLoading = signal(false);
    readonly filteredOptions = signal<any[]>([]);

    readonly intl = inject(KlesDynamicFormIntl);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    private readonly matSelect = viewChild(MatSelect);
    private readonly virtualViewport = viewChild(CdkVirtualScrollViewport);

    searchOptions: IKlesSelectSearchOptions = {};

    private readonly deferredQuery$ = new Subject<DeferredQuery>();
    private sourceOptions: any[] = [];
    private visibleOptions: any[] = [];
    private isPanelOpen = false;
    private isDeferredSourceLoaded = false;
    private deferredOptionsRequest$?: Observable<any[]>;
    private restoreMatSelectScroll?: () => void;

    override ngOnInit(): void {
        super.ngOnInit();
        this.searchOptions = this.normalizeSearchOptions();

        this.group.controls[this.field.name].valueChanges.pipe(takeUntil(this._onDestroy)).subscribe((values) => {
            this.updateSelectAllState(values);
            this.changeDetectorRef.markForCheck();
        });

        if (this.usesDeferredSource()) {
            const selected = this.selectedValues();
            this.sourceOptions = selected;
            this.setVisibleOptions(selected);
            // MatSelect cannot open without at least one MatOption. When search is
            // disabled, keep the loading option rendered until the deferred source
            // is requested on the first opening.
            this.isLoading.set(!this.isSearchEnabled() && selected.length === 0);
            this.initializeDeferredQueries();
        } else {
            this.loadInitialOptions();
        }

        if (this.isSearchEnabled() && !this.usesDeferredSource()) {
            this.searchControl.valueChanges
                .pipe(
                    startWith(this.searchControl.value),
                    debounce((value) => timer(value ? (this.searchOptions.debounceTime ?? this.field.debounceTime ?? 0) : 0)),
                    distinctUntilChanged(),
                    takeUntil(this._onDestroy),
                )
                .subscribe((value) => this.applyLocalFilter(value || ''));
        } else if (this.isSearchEnabled()) {
            this.searchControl.valueChanges
                .pipe(
                    debounce((value) => timer(value ? (this.searchOptions.debounceTime ?? this.field.debounceTime ?? 0) : 0)),
                    distinctUntilChanged(),
                    takeUntil(this._onDestroy),
                )
                .subscribe((value) => {
                    if (this.isPanelOpen) {
                        this.deferredQuery$.next({ kind: 'search', value: value || '' });
                    }
                });
        }
    }

    override ngOnDestroy(): void {
        this.restoreMatSelectScroll?.();
        this.deferredQuery$.complete();
        super.ngOnDestroy();
    }

    override ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.installMatSelectScrollCorrection();
    }

    isSearchEnabled(): boolean {
        return this.field.search === true || (this.field.search != null && typeof this.field.search === 'object');
    }

    panelClasses(): string[] {
        const classes = ['kles-select-panel'];
        if (this.field.virtualScroll) {
            classes.push('kles-select-virtual-panel');
        }
        if (this.isSearchEnabled()) {
            classes.push('kles-select-has-search');
        }
        return classes;
    }

    onOpenedChange(opened: boolean): void {
        this.isPanelOpen = opened;

        if (this.usesDeferredSource()) {
            if (opened) {
                this.isDeferredSourceLoaded = false;
                // Keep the initial request alive while search terms replace each
                // other, otherwise switchMap cancels the baseline option loading.
                this.deferredOptionsRequest$ = this.resolveOptions().pipe(shareReplay({ bufferSize: 1, refCount: false }));
            }
            this.deferredQuery$.next(opened ? { kind: 'open', value: this.searchControl.value || '' } : { kind: 'close' });
        }

        if (!opened && this.isSearchEnabled() && (this.searchOptions.clearOnClose ?? true)) {
            this.searchControl.setValue('');
        }

        if (opened && this.field.virtualScroll) {
            setTimeout(() => {
                this.virtualViewport()?.scrollToIndex(0);
                this.virtualViewport()?.checkViewportSize();
            });
        }
    }

    toggleVisibleOptions(state: { checked: boolean }): void {
        const selected = this.selectedValues();
        const enabledOptions = this.visibleOptions.filter((option) => !option?.disabled);

        if (!state.checked) {
            const remaining = selected.filter((value) => !enabledOptions.some((option) => this.compareFn(value, option)));
            this.group.controls[this.field.name].patchValue(remaining);
            return;
        }

        if (enabledOptions.length > 0) {
            const added = enabledOptions.filter((option) => !selected.some((value) => this.compareFn(value, option)));
            this.group.controls[this.field.name].patchValue([...selected, ...added]);
        }
    }

    getHiddenSelectedOptions(): any[] {
        const selected = this.selectedValues();
        if (this.field.virtualScroll) {
            return selected;
        }

        return selected.filter((selectedOption) => !this.visibleOptions.some((option) => this.compareFn(selectedOption, option)));
    }

    compareFn = (first: any, second: any): boolean => {
        if (this.field.property && first && second) {
            return first[this.field.property] === second[this.field.property];
        }
        return first === second;
    };

    private normalizeSearchOptions(): IKlesSelectSearchOptions {
        if (!this.isSearchEnabled()) {
            return {};
        }

        const configured = typeof this.field.search === 'object' ? this.field.search : {};
        return {
            mode: configured.mode ?? 'local',
            keys: configured.keys ?? this.field.searchKeys,
            debounceTime: configured.debounceTime ?? this.field.debounceTime,
            minLength: configured.minLength ?? 0,
            clearOnClose: configured.clearOnClose ?? true,
            placeholder: configured.placeholder,
            ariaLabel: configured.ariaLabel,
        };
    }

    private usesDeferredSource(): boolean {
        return !!this.field.lazy || this.searchOptions.mode === 'remote';
    }

    private loadInitialOptions(): void {
        if (isObservable(this.field.options) || typeof this.field.options === 'function') {
            this.isLoading.set(true);
        }

        this.resolveOptions()
            .pipe(takeUntil(this._onDestroy))
            .subscribe((options) => {
                const safeOptions = options ?? [];
                this.isLoading.set(false);
                this.sourceOptions = safeOptions;
                if (this.isSearchEnabled()) {
                    this.applyLocalFilter(this.searchControl.value || '');
                } else {
                    this.setVisibleOptions(safeOptions);
                }
            });
    }

    private initializeDeferredQueries(): void {
        this.deferredQuery$
            .pipe(
                switchMap((query) => {
                    if (query.kind === 'close') {
                        const selected = this.selectedValues();
                        // Preserve a disabled loading option when the closed select
                        // would otherwise contain no option and could not reopen.
                        return of({ loading: !this.isSearchEnabled() && selected.length === 0, options: selected, sourceOptions: undefined as any[] | undefined });
                    }

                    const search = query.value || '';
                    const searchLength = search.trim().length;
                    const isBelowMinimumLength = searchLength > 0 && searchLength < (this.searchOptions.minLength ?? 0);
                    if (query.kind === 'search' && isBelowMinimumLength) {
                        if (this.isDeferredSourceLoaded) {
                            return of({ loading: false, options: this.sourceOptions, sourceOptions: undefined as any[] | undefined });
                        }

                        const options$ = this.deferredOptionsRequest$ ?? this.resolveOptions();
                        return concat(
                            of({ loading: true, options: [] as any[], sourceOptions: undefined as any[] | undefined }),
                            options$.pipe(
                                map((options) => options ?? []),
                                map((sourceOptions) => ({ loading: false, options: sourceOptions, sourceOptions })),
                            ),
                        );
                    }

                    if (query.kind === 'search' && this.searchOptions.mode !== 'remote' && this.isDeferredSourceLoaded) {
                        return of({ loading: false, options: this.filterOptions(this.sourceOptions, search), sourceOptions: undefined as any[] | undefined });
                    }

                    const options$ =
                        this.searchOptions.mode === 'remote' && typeof this.field.options === 'function' && searchLength > 0
                            ? this.resolveOptions(search)
                            : (this.deferredOptionsRequest$ ?? this.resolveOptions());
                    return concat(
                        of({ loading: true, options: [] as any[], sourceOptions: undefined as any[] | undefined }),
                        options$.pipe(
                            map((options) => options ?? []),
                            map((sourceOptions) => ({
                                loading: false,
                                sourceOptions: this.searchOptions.mode === 'remote' && searchLength > 0 ? undefined : sourceOptions,
                                options: this.searchOptions.mode === 'remote' ? sourceOptions : this.filterOptions(sourceOptions, search),
                            })),
                        ),
                    );
                }),
                takeUntil(this._onDestroy),
            )
            .subscribe(({ loading, options, sourceOptions }) => {
                this.isLoading.set(loading);
                if (!loading) {
                    if (sourceOptions !== undefined) {
                        this.sourceOptions = sourceOptions;
                        this.isDeferredSourceLoaded = true;
                    }
                    this.setVisibleOptions(options);
                }
            });
    }

    private resolveOptions(search?: string): Observable<any[]> {
        if (isObservable(this.field.options)) {
            return this.field.options as Observable<any[]>;
        }
        if (typeof this.field.options === 'function') {
            return this.field.options(search, this.group.getRawValue());
        }
        return of(this.field.options ?? []);
    }

    private applyLocalFilter(value: string): void {
        const searchLength = value.trim().length;
        const options = searchLength > 0 && searchLength < (this.searchOptions.minLength ?? 0) ? this.sourceOptions : this.filterOptions(this.sourceOptions, value);
        this.setVisibleOptions(options);
    }

    private setVisibleOptions(options: any[]): void {
        this.visibleOptions = options;
        this.filteredOptions.set(options);
        this.updateSelectAllState(this.group.controls[this.field.name].value);
        this.changeDetectorRef.markForCheck();
    }

    private filterOptions(options: any[], value: string): any[] {
        const search = value.trim().toLocaleLowerCase();
        if (!search) {
            return options;
        }

        const keys = this.searchOptions.keys ?? [];
        return options.filter((option) => {
            const keyMatch = keys.some((key) => this.normalizeSearchValue(option?.[key]).includes(search));
            const propertyMatch = this.field.property ? this.normalizeSearchValue(option?.[this.field.property]).includes(search) : false;
            return keyMatch || propertyMatch || (!keys.length && !this.field.property && this.normalizeSearchValue(option).includes(search));
        });
    }

    private normalizeSearchValue(value: unknown): string {
        return value == null ? '' : String(value).toLocaleLowerCase();
    }

    private installMatSelectScrollCorrection(): void {
        if (this.restoreMatSelectScroll || (!this.isSearchEnabled() && !this.field.multiple)) {
            return;
        }

        const matSelect = this.matSelect() as unknown as (MatSelect & MatSelectInternals) | undefined;
        if (!matSelect) {
            return;
        }

        const originalScrollOptionIntoView = matSelect._scrollOptionIntoView;
        matSelect._scrollOptionIntoView = (index: number) => {
            const options = matSelect.options.toArray();
            const option = options[index];
            const optionElement = option?._getHostElement();

            if (optionElement?.classList.contains('kles-select-search-option')) {
                const firstOptionIndex = options.findIndex((candidate) => {
                    const element = candidate._getHostElement();
                    return !candidate.disabled && !element.classList.contains('kles-hidden-selected-option');
                });
                if (firstOptionIndex >= 0 && matSelect._keyManager.activeItemIndex !== firstOptionIndex) {
                    matSelect._keyManager.setActiveItem(firstOptionIndex);
                }
                return;
            }

            originalScrollOptionIntoView.call(matSelect, index);
            requestAnimationFrame(() => this.keepOptionVisible(option?._getHostElement()));
        };

        this.restoreMatSelectScroll = () => {
            matSelect._scrollOptionIntoView = originalScrollOptionIntoView;
            this.restoreMatSelectScroll = undefined;
        };
    }

    private keepOptionVisible(activeOption?: HTMLElement): void {
        const panel = this.matSelect()?.panel?.nativeElement as HTMLElement | undefined;
        if (!panel || !activeOption || !panel.contains(activeOption)) {
            return;
        }

        const options = panel.querySelectorAll<HTMLElement>('.mat-mdc-option:not(.kles-select-search-option):not(.kles-hidden-selected-option)');
        if (activeOption === options.item(0)) {
            panel.scrollTop = 0;
            return;
        }
        if (activeOption === options.item(options.length - 1)) {
            panel.scrollTop = panel.scrollHeight;
            return;
        }

        const panelRect = panel.getBoundingClientRect();
        const fixedHeader = panel.querySelector<HTMLElement>('.selectAll') ?? panel.querySelector<HTMLElement>('.kles-select-search-option');
        const visibleTop = fixedHeader?.getBoundingClientRect().bottom ?? panelRect.top;
        const optionRect = activeOption.getBoundingClientRect();
        if (optionRect.top < visibleTop) {
            panel.scrollTop += optionRect.top - visibleTop;
        } else if (optionRect.bottom > panelRect.bottom) {
            panel.scrollTop += optionRect.bottom - panelRect.bottom;
        }
    }

    private selectedValues(): any[] {
        const value = this.group.controls[this.field.name].value;
        if (value === undefined || value === null) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }

    private updateSelectAllState(values: any): void {
        if (!this.field.multiple) {
            return;
        }

        const selected = Array.isArray(values) ? values : [];
        const enabledOptions = this.visibleOptions.filter((option) => !option?.disabled);
        const selectedCount = enabledOptions.filter((option) => selected.some((value) => this.compareFn(value, option))).length;
        const allSelected = enabledOptions.length > 0 && selectedCount === enabledOptions.length;
        this.selectAllIndeterminate.set(selectedCount > 0 && !allSelected);
        this.selectAllControl.setValue(allSelected, { emitEvent: false });
    }
}
