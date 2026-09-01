import type { IKlesFieldConfig } from './field.config.interface';

export interface IKlesElementLayoutBreakpoint {
    colSpan?: number;
    rowSpan?: number;
    colStart?: number;
    rowStart?: number;
}

export interface IKlesElementLayout extends IKlesElementLayoutBreakpoint {
    class?: string | string[];
    responsive?: {
        xs?: IKlesElementLayoutBreakpoint;
        sm?: IKlesElementLayoutBreakpoint;
        md?: IKlesElementLayoutBreakpoint;
        lg?: IKlesElementLayoutBreakpoint;
        xl?: IKlesElementLayoutBreakpoint;
    };
}

export interface IKlesLayoutConfig {
    /** Number of columns in the grid. Defaults to 12. */
    columns?: number;
    /** CSS gap between grid cells. Defaults to 10px. */
    gap?: string;
}

interface IKlesStructuralElement {
    layout?: IKlesElementLayout;
}

export interface IKlesFormSection extends IKlesStructuralElement {
    type: 'section';
    title: string;
    description?: string;
    /** Material icon displayed before the section title. */
    icon?: string;
    /** Registered Material SVG icon displayed before the section title. */
    iconSvg?: string;
    fields: KlesFormElement[];
    layoutConfig?: IKlesLayoutConfig;
}

/** A visual layout group. Unlike an EnumType.group field, it creates no FormGroup. */
export interface IKlesFormLayoutGroup extends IKlesStructuralElement {
    type: 'layoutGroup';
    fields: KlesFormElement[];
    layoutConfig?: IKlesLayoutConfig;
}

export interface IKlesFormDivider extends IKlesStructuralElement {
    type: 'divider';
}

export interface IKlesFormSpacer extends IKlesStructuralElement {
    type: 'spacer';
    size?: string | number;
}

export type KlesFormStructuralElement = IKlesFormSection | IKlesFormLayoutGroup | IKlesFormDivider | IKlesFormSpacer;
export type KlesFormElement = IKlesFieldConfig | KlesFormStructuralElement;

export function isKlesStructuralElement(element: KlesFormElement): element is KlesFormStructuralElement {
    return element.type === 'section' || element.type === 'layoutGroup' || element.type === 'divider' || element.type === 'spacer';
}

export function flattenKlesFields(elements: readonly KlesFormElement[]): IKlesFieldConfig[] {
    return elements.flatMap((element) => (isKlesStructuralElement(element) && (element.type === 'section' || element.type === 'layoutGroup') ? flattenKlesFields(element.fields) : isKlesStructuralElement(element) ? [] : [element]));
}
