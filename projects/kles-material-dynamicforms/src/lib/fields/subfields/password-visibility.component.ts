import { Component, inject, Input, signal } from '@angular/core';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { IKlesFieldConfig } from '../../interfaces/field.config.interface';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { IKlesField } from '../../interfaces/field.interface';
import { FIELD, GROUP, SIBLING_FIELDS } from '../../token';


@Component({
    selector: 'kles-form-password-visibility',
    template: `
        <button [disabled]="group?.get(field?.name).disabled" mat-icon-button aria-label="visibility" type="button" (click)="toggleVisibility($event)">
            <mat-icon>{{ hide() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
    `,
    standalone: true,
    imports: [MatIcon, MatIconButton],
})
export class KlesFormPasswordVisibilityComponent implements IKlesField {
    readonly field = inject<IKlesFieldConfig>(FIELD);
    readonly group = inject<FormGroup<any>>(GROUP);
    readonly siblingFields = inject<IKlesFieldConfig[]>(SIBLING_FIELDS);


    hide = signal(true);

    toggleVisibility(event): void {
        event.stopPropagation();
        this.hide.set(!this.hide());
        // this.field.inputType = this.hide ? 'password' : 'text';
        //TODO
    }
}
