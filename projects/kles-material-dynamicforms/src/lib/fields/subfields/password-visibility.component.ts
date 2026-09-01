import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IKlesFieldConfig } from '../../interfaces/field.config.interface';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { IKlesField } from '../../interfaces/field.interface';
import { FIELD, GROUP, GROUP_UI, SIBLING_FIELDS } from '../../token';
import { GroupUiState } from '../../ui/ui-state/group-ui-state';

@Component({
    selector: 'kles-form-password-visibility',
    template: `
        <button [disabled]="group.controls[field.name].disabled" matIconButton aria-label="visibility" type="button" (click)="toggleVisibility($event)">
            <mat-icon>{{ hide() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon, MatIconButton],
})
export class KlesFormPasswordVisibilityComponent implements IKlesField {
    readonly field = inject<IKlesFieldConfig>(FIELD);
    readonly group = inject<FormGroup<any>>(GROUP);
    readonly siblingFields = inject<IKlesFieldConfig[]>(SIBLING_FIELDS);

    public readonly ui = inject<GroupUiState>(GROUP_UI, { optional: true });

    hide = computed(() => {
        return this.ui?.get(this.field.name)?.value().inputType === 'password';
    });

    toggleVisibility(event: MouseEvent): void {
        event.stopPropagation();
        this.ui?.get(this.field.name)?.patchValue({ inputType: this.hide() ? 'text' : 'password' });
    }
}
