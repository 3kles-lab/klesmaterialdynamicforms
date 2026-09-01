import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ArrayFormatPipe, IKlesComponent } from 'kles-material-dynamicforms';

interface SelectOption {
    BUAR: string;
    TX40: string;
}

@Component({
    selector: 'kles-select-trigger',
    template: `
        <span>
            {{ value | arrayFormat: 'BUAR' }}
        </span>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ArrayFormatPipe],
})
export class SelectTriggerComponent implements IKlesComponent<SelectOption[]> {
    @Input({ required: true }) value: SelectOption[] = [];
}
