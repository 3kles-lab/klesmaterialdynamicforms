import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ArrayFormatPipe, IKlesComponent } from 'kles-material-dynamicforms';
import { SelectOption } from './select-option.component';

@Component({
    selector: 'kles-select-trigger',
    template: `
        <span>
            {{ selectedValues | arrayFormat: 'BUAR' }}
        </span>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ArrayFormatPipe],
})
export class SelectTriggerComponent implements IKlesComponent<SelectOption[] | null | undefined> {
    @Input({ required: true }) value: SelectOption[] | null | undefined;

    get selectedValues(): SelectOption[] {
        return this.value ?? [];
    }
}
