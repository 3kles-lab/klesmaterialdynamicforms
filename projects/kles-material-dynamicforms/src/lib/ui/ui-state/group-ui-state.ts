import { ɵTypedOrUntyped } from '@angular/forms';
import { AbstractUiState } from './ui-state.abstract';
import { computed, Signal } from '@angular/core';

export class GroupUiState<TUiState extends { [K in keyof TUiState]: AbstractUiState<any> } = any> extends AbstractUiState<any, any> {
    public states: ɵTypedOrUntyped<TUiState, TUiState, { [key: string]: AbstractUiState<any> }> = {} as TUiState;

    private readonly _computedValue = computed(() => {
        return this._snapshot();
    });

    constructor(states?: TUiState) {
        super();
        this.states = (states ?? ({} as any)) as any;
        this._value.set(this._snapshot());
    }

    public override setValue(value: any): void {
        if (value == null) return;
        (Object.keys(value) as Array<keyof TUiState>).forEach((name) => {
            (this.states as any)[name]?.setValue((value as any)[name]);
        });

        this._value.set(value);
    }

    public override patchValue(value: any): void {
        if (value == null) return;
        (Object.keys(value) as Array<keyof TUiState>).forEach((name) => {
            const state = (this.states as any)[name];
            if (state) {
                state.patchValue(value[name]);
            }
        });

        const curr = this._value() ?? {};
        this._value.set({ ...(curr as any), ...(value as any) });
    }

    public override _find(name: string | number): AbstractUiState | null {
        const key = String(name);
        const has = Object.prototype.hasOwnProperty.call(this.states as any, key);
        return has ? ((this.states as any)[key] as AbstractUiState) : null;
    }

    public addUiState(name: any, uiState: any): void {
        this.states[name] = uiState;

        const curr = this._value() ?? {};
        this._value.set({ ...(curr as any), [name]: uiState.value() });
    }

    override get value(): Signal<any> {
        return this._computedValue;
    }

    private _snapshot(): any {
        const out: any = {};
        for (const key of Object.keys(this.states as any)) {
            out[key] = (this.states as any)[key]?.value();
        }
        return out;
    }
}
