import { Type } from '@angular/core';

/** Contract implemented by components used to render an option or a select trigger. */
export interface IKlesComponent<TValue = unknown> {
    value: TValue;
}

/** Angular component type compatible with the dynamic option renderer. */
export type KlesComponentType<TValue = unknown> = Type<IKlesComponent<TValue>>;
