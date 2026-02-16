import { AbstractUiState } from './ui-state.abstract';

export class ArrayUiState extends AbstractUiState<any, any> {
    public states: AbstractUiState[] = [];

    override setValue(value: any): void {
        value.forEach((newValue: any, index: number) => {
            this.at(index).setValue(newValue);
        });
    }

    override patchValue(value: any): void {
        if (value == null) return;

        value.forEach((newValue, index) => {
            if (this.at(index)) {
                this.at(index).patchValue(newValue);
            }
        });
    }

    at(index: number): AbstractUiState {
        return this.states?.[index];
    }

    override _find(name: string | number): AbstractUiState | null {
        return this.at(name as number) ?? null;
    }

    push(control: AbstractUiState | Array<AbstractUiState>): void {
        if (Array.isArray(control)) {
            control.forEach((ctrl) => {
                this.states.push(ctrl);
            });
        } else {
            this.states.push(control);
        }
    }
}
