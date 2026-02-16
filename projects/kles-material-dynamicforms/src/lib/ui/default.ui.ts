import { AbstractUiState } from './ui-state/ui-state.abstract';
import { ControlUiState } from './ui-state/control-ui-state';
import { KlesAbstractFormUiControl } from './ui.abstract';

export class KlesFormUiControl extends KlesAbstractFormUiControl {
    create(): AbstractUiState {
        return new ControlUiState({
            inputType: this.field.inputType,
            min: this.field.min,
            max: this.field.max,
            maxLength: this.field.maxLength,
            step: this.field.step,
            hostClass: this.field.hostClass,
            ngClass: this.field.ngClass,
            ngStyle: this.field.ngStyle,
            indeterminate: this.field.indeterminate ?? false,
            color: this.field.color,
            icon: this.field.icon,
            iconSvg: this.field.iconSvg,
            appearance: this.field.appearance ?? 'fill',
        });
    }
}
