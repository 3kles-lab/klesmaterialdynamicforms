import { componentMapper } from '../decorators/component.decorator';
import { klesFieldUiFactory } from '../factories/field.factory';
import { KlesFormUiControl } from './default.ui';
import { AbstractUiState } from './ui-state/ui-state.abstract';
import { GroupUiState } from './ui-state/group-ui-state';
import { ArrayUiState } from './ui-state/array-ui-state';

export class KlesFormUiArray extends KlesFormUiControl {
    public create(): AbstractUiState<any, any> {
        const array = new ArrayUiState();

        if (this.field.value && Array.isArray(this.field.value)) {
            if (this.field.collections && Array.isArray(this.field.collections)) {
                this.field.value.forEach(() => {
                    const group = new GroupUiState();
                    this.field.collections?.forEach((subfield) => {
                        let control;
                        if (subfield.type) {
                            control = componentMapper.find((c) => c.type === subfield.type)?.ui(subfield) || klesFieldUiFactory(subfield);
                        } else {
                            control = componentMapper.find((c) => c.component === subfield.component)?.ui(subfield) || klesFieldUiFactory(subfield);
                        }
                        group.addUiState(subfield.name, control);
                    });
                    array.push(group);
                });
            }
        } else {
            const group = new GroupUiState();
            this.field.collections?.forEach((subfield) => {
                let control;
                if (subfield.type) {
                    control = componentMapper.find((c) => c.type === subfield.type)?.ui(subfield) || klesFieldUiFactory(subfield);
                } else {
                    control = componentMapper.find((c) => c.component === subfield.component)?.ui(subfield) || klesFieldUiFactory(subfield);
                }
                group.addUiState(subfield.name, control);
            });
            array.push(group);
        }

        return array;
    }
}
