import { Component } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { IKlesClearControl } from "../interfaces/clear-control.interface";
import { IKlesFieldConfig } from "../interfaces/field.config.interface";

@Component({
    selector: 'kles-form-clear',
    template: `
    <button [disabled]="isDisable()" mat-icon-button aria-label="Clear" type="button"
        (click)="clear($event)">
        <mat-icon>close</mat-icon>
    </button>
    `,

})
export class KlesFormClearComponent implements IKlesClearControl {
    field: IKlesFieldConfig;
    group: UntypedFormGroup;
    siblingFields: IKlesFieldConfig[];

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