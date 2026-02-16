import { ɵTypedOrUntyped } from '@angular/forms';
import { AbstractUiState } from './ui-state.abstract';

export class GroupUiState<TUiState extends { [K in keyof TUiState]: AbstractUiState<any> } = any> extends AbstractUiState<any, any> {
    public states: ɵTypedOrUntyped<TUiState, TUiState, { [key: string]: AbstractUiState<any> }> = {} as TUiState;

    constructor(states?: TUiState) {
        super();
        this.states = states;
    }

    override setValue(value: any): void {
        (Object.keys(value) as Array<keyof TUiState>).forEach((name) => {
            (this.states as any)[name]?.setValue((value as any)[name]);
        });
    }

    override patchValue(value: any): void {
        if (value == null) return;
        (Object.keys(value) as Array<keyof TUiState>).forEach((name) => {
            const state = (this.states as any)[name];
            if (state) {
                state.patchValue(value[name]);
            }
        });
    }

    override _find(name: string | number): AbstractUiState | null {
        return this.states.hasOwnProperty(name as string) ? (this.states as any)[name as keyof TUiState] : null;
    }

    addUiState(name: any, uiState: any): void {
        this.states[name] = uiState;
    }
}
