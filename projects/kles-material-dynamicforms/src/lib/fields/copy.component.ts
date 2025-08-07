import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { IKlesField } from '../interfaces/field.interface';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'kles-form-copy',
    template: `
        <button #tooltip="matTooltip" mat-icon-button color="primary" type="button" (click)="copy($event)" [matTooltipDisabled]="true" [matTooltip]="tooltipText" matTooltipPosition="above">
            <mat-icon>content_copy</mat-icon>
        </button>
    `,
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, ClipboardModule],
})
export class KlesFormCopyComponent implements OnInit, IKlesField {
    @ViewChild('tooltip') tooltip: MatTooltip;

    field: IKlesFieldConfig;
    group: UntypedFormGroup;
    siblingFields: IKlesFieldConfig[];

    tooltipText: string;

    constructor(private clipBoard: Clipboard) {}

    ngOnInit(): void {
        this.tooltipText = this.field.copyTooltip || '';
    }

    copy(event): void {
        event.stopPropagation();
        const copyText = (this.field.property ? this.group.controls[this.field.name].value?.[this.field.property] : this.group.controls[this.field.name].value) || '';
        this.clipBoard.copy(copyText);

        this.tooltip.disabled = false;
        this.tooltip.show();
        setTimeout(() => {
            this.tooltip.disabled = true;
        }, 200);
    }
}
