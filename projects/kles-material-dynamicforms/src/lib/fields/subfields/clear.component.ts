import { Component, Input } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { IKlesClearControl } from "../../interfaces/clear-control.interface";
import { IKlesFieldConfig } from "../../interfaces/field.config.interface";
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";

@Component({
    selector: 'kles-form-clear',
    template: `
    <button [disabled]="isDisable()" mat-icon-button aria-label="Clear" type="button"
        (click)="clear($event)">
        <mat-icon>close</mat-icon>
    </button>
    `,
    standalone: true,
    imports: [CommonModule, MatIcon, MatIconButton]
})
export class KlesFormClearComponent implements IKlesClearControl {
    @Input() field: IKlesFieldConfig;
    @Input() group: UntypedFormGroup;
    @Input() siblingFields: IKlesFieldConfig[];

    clear(event): void {
        event.stopPropagation();
        this.group.controls[this.field.name].reset();
    }

    isDisable(): boolean {
        return this.group.get(this.field.name).disabled
            || !this.group.get(this.field.name).value
            || (Array.isArray(this.group.get(this.field.name).value) && !this.group.get(this.field.name).value.length);

    }
}