import type { IKlesFieldConfig } from './field.config.interface';
import type { UntypedFormGroup } from '@angular/forms';
import type { Observable } from 'rxjs';

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
    /** CSS gap between grid cells. Defaults to 0. */
    gap?: string;
}

interface IKlesStructuralElement {
    layout?: IKlesElementLayout;
}

/** Inputs captured for one resolution of a container's children. */
export interface IKlesFormFieldsResolveEvent<TContext = unknown> {
    /** Current external context, or null when none was provided. */
    readonly context: TContext | null;
    /** Root form group. Read values from the snapshot when performing asynchronous work. */
    readonly group: UntypedFormGroup;
    /** Container whose fields will be replaced by the result. */
    readonly element: KlesFormFieldsContainer;
    /** Root getRawValue() snapshot, including disabled controls. Treat nested values as read-only. */
    readonly values: Readonly<Record<string, unknown>>;
}

/** Each returned or emitted array replaces the container's complete list of children. */
export type KlesFormFieldsResolveResult =
    | readonly KlesFormElement[]
    | Promise<readonly KlesFormElement[]>
    | Observable<readonly KlesFormElement[]>;

export type IKlesFormFieldsResolver<TContext = unknown> = (event: IKlesFormFieldsResolveEvent<TContext>) => KlesFormFieldsResolveResult;

/**
 * Declarative child-field resolution shared by dynamic slots and visual containers.
 * The dependency engine executes the resolver and exposes its result through
 * KlesDynamicFormComponent.fieldResolutions. Resolved children are automatically
 * synchronized with controls and rendered at the container's position.
 */
export interface IKlesFormFieldsResolution {
    /**
     * Root-relative control paths using dot notation, such as 'typeDossier' or 'address.country'.
     * Resolve once after initialization, then when a dependency changes by Object.is comparison.
     * Omitted or empty dependencies mean initial resolution only. Context is an input, not a trigger.
     */
    dependsOn?: readonly string[];
    /**
     * Replace children at this container's position; [] removes them.
     * Keep the last successful children (initially fields) while loading or after an error.
     * Ignore obsolete results and unsubscribe from replaced or removed Observable resolutions.
     * The supplied configuration is not mutated; the form maintains an effective child tree.
     */
    resolveFields?: IKlesFormFieldsResolver;
}

export interface IKlesFormSection extends IKlesStructuralElement, IKlesFormFieldsResolution {
    type: 'section';
    title: string;
    description?: string;
    /** Render as a Material expansion panel. Defaults to false. */
    collapsible?: boolean;
    /** Expansion panel state. Defaults to true; only applies when collapsible is true. */
    expanded?: boolean;
    /** Material icon displayed before the section title. */
    icon?: string;
    /** Registered Material SVG icon displayed before the section title. */
    iconSvg?: string;
    /** Static children, also used as initial children when resolveFields is configured. */
    fields: KlesFormElement[];
    layoutConfig?: IKlesLayoutConfig;
}

/** A visual layout group. Unlike an EnumType.group field, it creates no FormGroup. */
export interface IKlesFormLayoutGroup extends IKlesStructuralElement, IKlesFormFieldsResolution {
    type: 'layoutGroup';
    /** Static children, also used as initial children when resolveFields is configured. */
    fields: KlesFormElement[];
    layoutConfig?: IKlesLayoutConfig;
}

/** A transparent insertion slot: no visual wrapper, grid or Angular FormGroup. */
export interface IKlesFormDynamicFields extends IKlesFormFieldsResolution {
    type: 'dynamicFields';
    /** Initial children, retained while loading or after an error. */
    fields: KlesFormElement[];
    /** Apply layout to the returned children, which inherit their parent's layout. */
    layout?: never;
}

export interface IKlesFormDivider extends IKlesStructuralElement {
    type: 'divider';
}

export interface IKlesFormSpacer extends IKlesStructuralElement {
    type: 'spacer';
    size?: string | number;
}

export type KlesFormFieldsContainer = IKlesFormSection | IKlesFormLayoutGroup | IKlesFormDynamicFields;
export type KlesFormStructuralElement = KlesFormFieldsContainer | IKlesFormDivider | IKlesFormSpacer;
export type KlesFormElement = IKlesFieldConfig | KlesFormStructuralElement;

export function isKlesStructuralElement(element: KlesFormElement): element is KlesFormStructuralElement {
    return isKlesFieldsContainer(element) || element.type === 'divider' || element.type === 'spacer';
}

export function isKlesFieldsContainer(element: KlesFormElement): element is KlesFormFieldsContainer {
    return element.type === 'section' || element.type === 'layoutGroup' || element.type === 'dynamicFields';
}

/** Remove transparent slots at one visual level, preserving visual containers. */
export function expandKlesDynamicFields(elements: readonly KlesFormElement[]): KlesFormElement[] {
    return elements.flatMap((element) => element.type === 'dynamicFields' ? expandKlesDynamicFields(element.fields) : [element]);
}

export function flattenKlesFields(elements: readonly KlesFormElement[]): IKlesFieldConfig[] {
    return elements.flatMap((element) => isKlesFieldsContainer(element) ? flattenKlesFields(element.fields) : isKlesStructuralElement(element) ? [] : [element]);
}
