import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IKlesComponent } from 'kles-material-dynamicforms';

interface AutocompleteOption {
    test: string;
    val: string;
}

@Component({
    selector: 'kles-auto',
    template: ` @if (value) {
        <span> {{ value.test }} - {{ value.val }} </span>
    }`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class AutocompleteComponent implements IKlesComponent<AutocompleteOption | null> {
    @Input({ required: true }) value!: AutocompleteOption | null;
}
