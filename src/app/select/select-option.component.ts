import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IKlesComponent } from 'kles-material-dynamicforms';

interface SelectOption {
    BUAR: string;
    TX40: string;
}

@Component({
    selector: 'kles-select-option',
    template: `
    <span>
        {{value.BUAR}} - {{value.TX40}}
    </span> 
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class SelectOptionComponent implements IKlesComponent<SelectOption> {
    @Input({ required: true }) value!: SelectOption;
}
