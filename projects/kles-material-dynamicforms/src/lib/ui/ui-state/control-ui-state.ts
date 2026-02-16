
import { IKlesFieldUi } from "../../interfaces/field.config.interface";
import { AbstractUiState } from "./ui-state.abstract";


export class ControlUiState<TValue extends IKlesFieldUi> extends AbstractUiState<TValue> {
    constructor(value?: TValue) {
        super();
        this._value.set(value);
    }

    override setValue(value: TValue): void {
        this._value.set(value);
    }

    override patchValue(value: TValue): void {
        this.setValue(value);
    }
}
