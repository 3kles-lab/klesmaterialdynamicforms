import { Component, inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IKlesField } from '../../interfaces/field.interface';
import { IKlesFieldConfig } from '../../interfaces/field.config.interface';
import { FIELD, GROUP, SIBLING_FIELDS } from '../../token';
import { KlesDynamicFormIntl } from '../../dynamic-form-intl';

@Component({
    selector: 'kles-form-copy',
    template: `
        <button #tooltip="matTooltip" matIconButton color="primary" type="button" (click)="copy($event)" [matTooltipDisabled]="true" [matTooltip]="tooltipText" matTooltipPosition="above">
            <mat-icon>content_copy</mat-icon>
        </button>
    `,
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatTooltipModule, ClipboardModule],
})
export class KlesFormCopyComponent implements IKlesField {
    @ViewChild('tooltip') tooltip!: MatTooltip;

    readonly field = inject<IKlesFieldConfig>(FIELD);
    readonly group = inject<FormGroup<any>>(GROUP);
    readonly siblingFields = inject<IKlesFieldConfig[]>(SIBLING_FIELDS);
    readonly intl = inject(KlesDynamicFormIntl);

    tooltipText: string;

    constructor(private clipBoard: Clipboard) {
        this.tooltipText = this.intl.copy;
    }

    copy(event: MouseEvent): void {
        event.stopPropagation();
        const copyText = (this.field.property ? this.group.controls[this.field.name].value?.[this.field.property] : this.group.controls[this.field.name].value) || '';
        this.clipBoard.copy(copyText);

        this.tooltip.disabled = false;
        this.tooltip.show();
        setTimeout(() => {
            this.tooltip.disabled = true;
        }, 1000);
    }
}
