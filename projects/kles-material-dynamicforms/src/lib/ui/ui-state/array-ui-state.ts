import { computed, Signal } from '@angular/core';
import { AbstractUiState } from './ui-state.abstract';

export class ArrayUiState<TItem extends AbstractUiState<any, any> = AbstractUiState<any, any>, TValue extends any[] = any[], TRawValue extends TValue = TValue> extends AbstractUiState<TValue, TRawValue> {
    public states: TItem[] = [];

    private readonly _computedValue = computed(() => {
        return this.states.map((s) => s.value());
    });

    constructor(states?: TItem[]) {
        super();
        this.states = states ?? [];
        this._value.set(this.states.map((s) => s.value()) as any);
    }

    public override get value(): Signal<any> {
        return this._computedValue;
    }

    public override setValue(value: TRawValue): void {
        if (!Array.isArray(value)) {
            return;
        }
        value.forEach((newValue: any, index: number) => {
            this.at(index)?.setValue(newValue);
        });
        this._value.set(value);
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

        const curr = this._value() ?? [];
        const next = [...curr];
        value.forEach((v, i) => (next[i] = v));
        this._value.set(next as any);
    }

    public at(index: number): AbstractUiState {
        return this.states?.[index] ?? null;
    }

    public override _find(name: string | number): AbstractUiState | null {
        const idx = typeof name === 'number' ? name : Number(name);
        return Number.isFinite(idx) ? this.at(idx) : null;
    }

    public push(control: TItem | TItem[]): void {
        if (Array.isArray(control)) {
            control.forEach((ctrl) => {
                this.states.push(ctrl);
            });
        } else {
            this.states.push(control);
        }
        this._value.set(this.states.map((s) => s.value()) as any);
    }
}
