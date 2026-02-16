import { componentMapper } from '../decorators/component.decorator';
import { klesFieldUiFactory } from '../factories/field.factory';
import { KlesFormUiControl } from './default.ui';
import { GroupUiState } from './ui-state/group-ui-state';
import { AbstractUiState } from './ui-state/ui-state.abstract';

export class KlesFormUiGroup extends KlesFormUiControl {
    public create(): AbstractUiState<any, any> {
        const subGroup = new GroupUiState();

        if (this.field.collections && Array.isArray(this.field.collections)) {
            this.field.collections.forEach((subfield) => {
                let ui;

                if (subfield.type) {
                    ui =
                        componentMapper.find((c) => c.type === subfield.type)?.ui({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] }) ||
                        klesFieldUiFactory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] });
                } else {
                    ui =
                        componentMapper.find((c) => c.component === subfield.component)?.ui({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] }) ||
                        klesFieldUiFactory({ ...subfield, value: subfield.value || this.field.value?.[subfield.name] });
                }

                subGroup.addUiState(subfield.name, ui);
            });
        }
        return subGroup;
    }
}
