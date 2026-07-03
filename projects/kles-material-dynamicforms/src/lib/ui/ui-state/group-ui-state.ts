import { ɵTypedOrUntyped } from '@angular/forms';
import { AbstractUiState } from './ui-state.abstract';
import { computed, Signal } from '@angular/core';

export class GroupUiState<TUiState extends { [K in keyof TUiState]: AbstractUiState<any> } = any> extends AbstractUiState<any, any> {
    public states: ɵTypedOrUntyped<TUiState, TUiState, { [key: string]: AbstractUiState<any> }> = {} as TUiState;

    constructor(states?: TUiState) {
        super();
        this.states = (states ?? ({} as any)) as any;
        for (const key of Object.keys(this.states as any)) {
            const state = (this.states as any)[key];
            state?.setParent(this, key);
        }
        this._value.set(this.buildInitialValue());
    }

    public override setValue(value: any): void {
        if (value == null) return;

        for (const name of Object.keys(value)) {
            const state = (this.states as any)[name];

            if (state) {
                state.setValue(value[name]);
            }
        }

        this._value.set(value);
        this.notifyParent();
    }

    public override patchValue(value: any): void {
        if (value == null) return;

        for (const name of Object.keys(value)) {
            const state = (this.states as any)[name];

            if (state) {
                state.patchValue(value[name]);
            }
        }

        const curr = this._value() ?? {};

        this._value.set({
            ...curr,
            ...value,
        });

        this.notifyParent();
    }

    override childValueChanged(key: string | number, value: any): void {
        const curr = this._value() ?? {};

        this._value.set({
            ...curr,
            [key]: value,
        });

        this.notifyParent();
    }

    public override _find(name: string | number): AbstractUiState | null {
        const key = String(name);
        const has = Object.prototype.hasOwnProperty.call(this.states as any, key);
        return has ? ((this.states as any)[key] as AbstractUiState) : null;
    }

    public addUiState(name: string, uiState: AbstractUiState<any>): void {
        (this.states as any)[name] = uiState;

        uiState.setParent(this, name);

        const curr = this._value() ?? {};

        this._value.set({
            ...curr,
            [name]: uiState.value(),
        });

        this.notifyParent();
    }

    private buildInitialValue(): any {
        const out: any = {};

        for (const key of Object.keys(this.states as any)) {
            out[key] = (this.states as any)[key]?.value();
        }

        return out;
    }

}
