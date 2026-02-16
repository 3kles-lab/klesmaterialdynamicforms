import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { AbstractUiState } from './ui-state/ui-state.abstract';
import { IKlesUi } from './ui.interface';

export abstract class KlesAbstractFormUiControl implements IKlesUi {
    constructor(protected field: IKlesFieldConfig) {}
    abstract create(): AbstractUiState;
}
