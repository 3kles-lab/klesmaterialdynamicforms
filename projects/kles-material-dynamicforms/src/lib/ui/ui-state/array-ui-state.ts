import { computed, Signal } from '@angular/core';
import { AbstractUiState } from './ui-state.abstract';

export class ArrayUiState<TItem extends AbstractUiState<any, any> = AbstractUiState<any, any>, TValue extends any[] = any[], TRawValue extends TValue = TValue> extends AbstractUiState<TValue, TRawValue> {
    public states: TItem[] = [];

    constructor(states?: TItem[]) {
        super();
        this.states = states ?? [];

        this.states.forEach((state, index) => {
            state.setParent(this, index);
        });

        this._value.set(this.states.map((state) => state.value()) as TValue);
    }

    public override setValue(value: TRawValue): void {
        if (!Array.isArray(value)) {
            return;
        }
        value.forEach((newValue: any, index: number) => {
            this.at(index)?.setValue(newValue);
        });

        this._value.set(value);
        this.notifyParent();
    }

    public override patchValue(value: Partial<TRawValue>): void {
        if (value == null) {
            return;
        }

        value.forEach((newValue, index) => {
            const st = this.at(index);
            if (st) {
                st.patchValue(newValue);
            }
        });

        const curr = this._value() ?? ([] as TValue[]);
        const next = [...curr];

        value.forEach((newValue, index) => {
            next[index] = {
                ...(next[index] ?? {}),
                ...(newValue as any),
            };
        });

        this._value.set(next as TValue);
        this.notifyParent();
    }

    override childValueChanged(key: string | number, value: any): void {
        const index = typeof key === 'number' ? key : Number(key);

        if (!Number.isInteger(index) || index < 0) return;

        const curr = this._value() ?? ([] as TValue[]);
        const next = [...curr];

        next[index] = value;

        this._value.set(next as TValue);
        this.notifyParent();
    }

    public at(index: number): AbstractUiState {
        return this.states?.[index] ?? null;
    }

    public override _find(name: string | number): AbstractUiState | null {
        const idx = typeof name === 'number' ? name : Number(name);
        return Number.isFinite(idx) ? this.at(idx) : null;
    }

    public push(control: TItem | TItem[]): void {
        const items = Array.isArray(control) ? control : [control];

        if (items.length === 0) {
            return;
        }

        for (const item of items) {
            const index = this.states.length;

            this.states.push(item);
            item.setParent(this, index);
        }

        this._value.set(this.states.map((s) => s.value()) as TValue);
        this.notifyParent();
    }

    public insert(index: number, state: TItem | TItem[]): void {
        const items = Array.isArray(state) ? state : [state];

        if (items.length === 0) {
            return;
        }

        const safeIndex = Math.max(0, Math.min(index, this.states.length));

        this.states.splice(safeIndex, 0, ...items);

        for (let i = safeIndex; i < this.states.length; i++) {
            this.states[i]?.setParent(this, i);
        }

        const curr = this._value() as any;
        const next = [...curr];

        next.splice(safeIndex, 0, ...items.map((item) => item.value()));

        this._value.set(next as TValue);
        this.notifyParent();
    }

    removeAt(index: number): void {
        if (index < 0 || index >= this.states.length) return;
        this.states.splice(index, 1);

        this.states.forEach((state, i) => {
            state.setParent(this, i);
        });

        const curr = this._value() ?? ([] as TValue[]);
        const next = [...curr];

        next.splice(index, 1);

        this._value.set(next as TValue);
        this.notifyParent();
    }

    clear(): void {
        this.states.length = 0;
        this._value.set([] as unknown as TValue);
        this.notifyParent();
    }
}
