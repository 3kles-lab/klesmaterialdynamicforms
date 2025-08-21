import { Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { IKlesField } from '../interfaces/field.interface';

@Component({
    selector: 'kles-form-password-visibility',
    template: `
        <button [disabled]="group?.get(field?.name).disabled" mat-icon-button aria-label="visibility" type="button" (click)="toggleVisibility($event)">
            <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
    `,
    standalone: true,
    imports: [CommonModule, MatIcon, MatIconButton],
})
export class KlesFormPasswordVisibilityComponent implements IKlesField {
    field: IKlesFieldConfig;
    group: UntypedFormGroup;
    siblingFields: IKlesFieldConfig[];

    hide = true;

    toggleVisibility(event): void {
        event.stopPropagation();
        this.hide = !this.hide;
        this.field.inputType = this.hide ? 'password' : 'text';
    }

}
