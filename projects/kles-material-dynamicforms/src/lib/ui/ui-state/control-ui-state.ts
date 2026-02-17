import { IKlesFieldUi } from '../../interfaces/field.config.interface';
import { AbstractUiState } from './ui-state.abstract';

export class ControlUiState<TValue extends IKlesFieldUi> extends AbstractUiState<TValue, TValue> {
    constructor(value?: TValue) {
        super();
        if (value !== undefined) {
            this._value.set(value);
        }
    }

    override setValue(value: TValue): void {
        this._value.set(value);
    }

    override patchValue(value: Partial<TValue> | TValue): void {
        if (value == null) {
            return;
        }

        const curr = this._value();
        if (curr == null) {
            this._value.set(value as TValue);
            return;
        }

        this._value.set({ ...(curr as any), ...(value as any) } as TValue);
    }
}
