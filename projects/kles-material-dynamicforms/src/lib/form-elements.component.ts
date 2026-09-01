import { CommonModule } from '@angular/common';
import { Component, Input, Signal, isDevMode } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { KlesDynamicFieldDirective } from './directive/dynamic-field.directive';
import { IKlesFieldConfig } from './interfaces/field.config.interface';
import {
    IKlesElementLayout,
    IKlesElementLayoutBreakpoint,
    IKlesFormLayoutGroup,
    IKlesFormSection,
    IKlesFormSpacer,
    IKlesLayoutConfig,
    KlesFormElement,
    flattenKlesFields,
    isKlesStructuralElement,
} from './interfaces/layout.interface';
import { GroupUiState } from './ui/ui-state/group-ui-state';

const DEFAULT_COLUMNS = 12;
const DEFAULT_GAP = '10px';

@Component({
    selector: 'kles-form-elements',
    standalone: true,
    host: { style: 'display: contents' },
    imports: [CommonModule, KlesDynamicFieldDirective, MatIcon],
    template: `
        @for (element of elements; track element) {
            @if (isVisible(element)) {
                <div class="kles-layout-item" [ngClass]="layoutClasses(element)" [ngStyle]="layoutStyles(element)">
                    @if (isSection(element)) {
                        <section class="kles-form-section">
                            <header class="kles-form-section-header">
                                <div class="kles-form-section-title">
                                    @if (section(element).iconSvg; as iconSvg) {
                                        <mat-icon [svgIcon]="iconSvg" aria-hidden="true" />
                                    } @else if (section(element).icon; as icon) {
                                        <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
                                    }
                                    <h3>{{ section(element).title }}</h3>
                                </div>
                                @if (section(element).description; as description) {
                                    <p>{{ description }}</p>
                                }
                            </header>
                            <div class="kles-layout-grid" [ngStyle]="containerStyles(section(element).layoutConfig)">
                                <kles-form-elements [elements]="section(element).fields" [group]="group" [ui]="ui" [context]="context" [layoutConfig]="section(element).layoutConfig ?? {}" />
                            </div>
                        </section>
                    } @else if (isLayoutGroup(element)) {
                        <div class="kles-layout-grid kles-form-layout-group" [ngStyle]="containerStyles(layoutGroup(element).layoutConfig)">
                            <kles-form-elements [elements]="layoutGroup(element).fields" [group]="group" [ui]="ui" [context]="context" [layoutConfig]="layoutGroup(element).layoutConfig ?? {}" />
                        </div>
                    } @else if (isDivider(element)) {
                        <hr class="kles-form-divider" />
                    } @else if (isSpacer(element)) {
                        <div class="kles-form-spacer" [style.height]="spacerSize(element)" aria-hidden="true"></div>
                    } @else {
                        <ng-container klesDynamicField [field]="field(element)" [group]="group" [ui]="ui" [siblingFields]="siblingFields" [context]="context" />
                    }
                </div>
            }
        }
    `,
    styles: [`
        .kles-layout-item {
            min-width: 0;
            grid-column-start: var(--kles-effective-col-start, var(--kles-col-start, auto));
            grid-column-end: span var(--kles-effective-col-span, var(--kles-col-span, 12));
            grid-row-start: var(--kles-effective-row-start, var(--kles-row-start, auto));
            grid-row-end: span var(--kles-effective-row-span, var(--kles-row-span, 1));
        }
        .kles-layout-grid {
            display: grid;
            grid-template-columns: repeat(var(--kles-grid-columns, 12), minmax(0, 1fr));
            gap: var(--kles-grid-gap, 10px);
        }
        .kles-form-section-header { margin-bottom: 14px; }
        .kles-form-section-title { display: flex; align-items: center; gap: 8px; }
        .kles-form-section-title mat-icon {
            width: 24px;
            height: 24px;
            font-size: 24px;
            color: var(--mat-sys-primary, currentColor);
        }
        .kles-form-section-header h3 {
            margin: 0;
            font-size: 1.25rem;
            line-height: 1.5rem;
            font-weight: 500;
        }
        .kles-form-section-header p { margin: 4px 0 0; }
        .kles-form-divider { border: 0; border-top: 1px solid currentColor; margin: 8px 0; opacity: .2; }
        @media (max-width: 599.98px) {
            .kles-layout-item {
                --kles-effective-col-span: var(--kles-col-span-xs, var(--kles-col-span, 12));
                --kles-effective-row-span: var(--kles-row-span-xs, var(--kles-row-span, 1));
                --kles-effective-col-start: var(--kles-col-start-xs, var(--kles-col-start, auto));
                --kles-effective-row-start: var(--kles-row-start-xs, var(--kles-row-start, auto));
            }
        }
        @media (min-width: 600px) {
            .kles-layout-item {
                --kles-effective-col-span: var(--kles-col-span-sm, var(--kles-col-span, 12));
                --kles-effective-row-span: var(--kles-row-span-sm, var(--kles-row-span, 1));
                --kles-effective-col-start: var(--kles-col-start-sm, var(--kles-col-start, auto));
                --kles-effective-row-start: var(--kles-row-start-sm, var(--kles-row-start, auto));
            }
        }
        @media (min-width: 960px) {
            .kles-layout-item {
                --kles-effective-col-span: var(--kles-col-span-md, var(--kles-col-span-sm, var(--kles-col-span, 12)));
                --kles-effective-row-span: var(--kles-row-span-md, var(--kles-row-span-sm, var(--kles-row-span, 1)));
                --kles-effective-col-start: var(--kles-col-start-md, var(--kles-col-start-sm, var(--kles-col-start, auto)));
                --kles-effective-row-start: var(--kles-row-start-md, var(--kles-row-start-sm, var(--kles-row-start, auto)));
            }
        }
        @media (min-width: 1280px) {
            .kles-layout-item {
                --kles-effective-col-span: var(--kles-col-span-lg, var(--kles-col-span-md, var(--kles-col-span-sm, var(--kles-col-span, 12))));
                --kles-effective-row-span: var(--kles-row-span-lg, var(--kles-row-span-md, var(--kles-row-span-sm, var(--kles-row-span, 1))));
                --kles-effective-col-start: var(--kles-col-start-lg, var(--kles-col-start-md, var(--kles-col-start-sm, var(--kles-col-start, auto))));
                --kles-effective-row-start: var(--kles-row-start-lg, var(--kles-row-start-md, var(--kles-row-start-sm, var(--kles-row-start, auto))));
            }
        }
        @media (min-width: 1920px) {
            .kles-layout-item {
                --kles-effective-col-span: var(--kles-col-span-xl, var(--kles-col-span-lg, var(--kles-col-span-md, var(--kles-col-span-sm, var(--kles-col-span, 12)))));
                --kles-effective-row-span: var(--kles-row-span-xl, var(--kles-row-span-lg, var(--kles-row-span-md, var(--kles-row-span-sm, var(--kles-row-span, 1)))));
                --kles-effective-col-start: var(--kles-col-start-xl, var(--kles-col-start-lg, var(--kles-col-start-md, var(--kles-col-start-sm, var(--kles-col-start, auto)))));
                --kles-effective-row-start: var(--kles-row-start-xl, var(--kles-row-start-lg, var(--kles-row-start-md, var(--kles-row-start-sm, var(--kles-row-start, auto)))));
            }
        }
    `],
})
export class KlesFormElementsComponent {
    private _elements: KlesFormElement[] = [];
    siblingFields: IKlesFieldConfig[] = [];
    private readonly layoutWarnings = new Set<string>();

    @Input({ required: true })
    set elements(value: KlesFormElement[]) {
        this._elements = value;
        this.siblingFields = flattenKlesFields(value);
    }
    get elements(): KlesFormElement[] { return this._elements; }
    @Input({ required: true }) group!: UntypedFormGroup;
    @Input({ required: true }) ui!: GroupUiState;
    @Input() context: Signal<unknown | null> | null = null;
    @Input() layoutConfig: IKlesLayoutConfig = {};

    isVisible(element: KlesFormElement): boolean {
        return isKlesStructuralElement(element) || element.visible !== false;
    }

    isSection(element: KlesFormElement): boolean { return isKlesStructuralElement(element) && element.type === 'section'; }
    isLayoutGroup(element: KlesFormElement): boolean { return isKlesStructuralElement(element) && element.type === 'layoutGroup'; }
    isDivider(element: KlesFormElement): boolean { return isKlesStructuralElement(element) && element.type === 'divider'; }
    isSpacer(element: KlesFormElement): boolean { return isKlesStructuralElement(element) && element.type === 'spacer'; }
    section(element: KlesFormElement): IKlesFormSection { return element as IKlesFormSection; }
    layoutGroup(element: KlesFormElement): IKlesFormLayoutGroup { return element as IKlesFormLayoutGroup; }
    field(element: KlesFormElement): IKlesFieldConfig { return element as IKlesFieldConfig; }

    containerStyles(config: IKlesLayoutConfig = {}): Record<string, string | number> {
        return {
            '--kles-grid-columns': this.columns(config),
            '--kles-grid-gap': config.gap?.trim() || DEFAULT_GAP,
        };
    }

    layoutClasses(element: KlesFormElement): string[] {
        const value = element.layout?.class;
        return Array.isArray(value) ? value : value ? [value] : [];
    }

    layoutStyles(element: KlesFormElement): Record<string, string | number> {
        const columns = this.columns(this.layoutConfig);
        const layout = element.layout ?? {};
        const styles: Record<string, string | number> = {};
        this.addPlacement(styles, layout, '', columns, true);
        for (const breakpoint of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
            const placement = layout.responsive?.[breakpoint];
            if (placement) this.addPlacement(styles, placement, `-${breakpoint}`, columns, false);
        }
        return styles;
    }

    spacerSize(element: KlesFormElement): string {
        const size = (element as IKlesFormSpacer).size ?? '16px';
        return typeof size === 'number' ? `${Math.max(0, size)}px` : size;
    }

    private addPlacement(styles: Record<string, string | number>, placement: IKlesElementLayoutBreakpoint, suffix: string, columns: number, defaults: boolean): void {
        const colStart = placement.colStart == null ? undefined : this.integer('colStart', placement.colStart, 1, columns);
        const maxSpan = colStart == null ? columns : columns - colStart + 1;
        if (defaults || placement.colSpan != null) styles[`--kles-col-span${suffix}`] = placement.colSpan == null ? columns : this.integer('colSpan', placement.colSpan, 1, maxSpan);
        if (defaults || placement.rowSpan != null) styles[`--kles-row-span${suffix}`] = placement.rowSpan == null ? 1 : this.integer('rowSpan', placement.rowSpan, 1, 999);
        if (colStart != null) styles[`--kles-col-start${suffix}`] = colStart;
        if (placement.rowStart != null) styles[`--kles-row-start${suffix}`] = this.integer('rowStart', placement.rowStart, 1, 999);
    }

    private columns(config: IKlesLayoutConfig): number {
        return config.columns == null ? DEFAULT_COLUMNS : this.integer('columns', config.columns, 1, 64);
    }

    private integer(name: string, value: number, min: number, max: number): number {
        const normalized = Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : min;
        const warning = `[KlesDynamicForm] ${name}=${value} is invalid; using ${normalized}.`;
        if (isDevMode() && normalized !== value && !this.layoutWarnings.has(warning)) {
            this.layoutWarnings.add(warning);
            console.warn(warning);
        }
        return normalized;
    }
}
