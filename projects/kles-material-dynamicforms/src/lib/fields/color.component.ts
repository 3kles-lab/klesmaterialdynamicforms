import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MaterialColorPickerTriggerComponent, parseColor, readableTextColor, toCssRgba } from '@3kles/kles-material-color-picker';

import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'kles-form-color',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatErrorMessageDirective, MaterialColorPickerTriggerComponent],
    template: `
        <mat-form-field class="form-element" [formGroup]="group" [appearance]="appearance()" [subscriptSizing]="field.subscriptSizing">
            <input
                matInput
                autocomplete="off"
                [matTooltip]="tooltip()"
                [attr.id]="field.id"
                [ngClass]="ngClass()"
                [placeholder]="placeholder()"
                [formControlName]="field.name"
                [style.background-color]="backgroundColor()"
                [style.color]="foregroundColor()"
            />

            <div matSuffix class="suffix">
                <kles-material-color-picker-trigger
                    [color]="currentColor()"
                    [outputFormat]="colorOption().format ?? 'hex8'"
                    [commitMode]="colorOption().commitMode ?? 'live'"
                    [alpha]="colorOption().alpha ?? true"
                    [eyeDropper]="colorOption().eyeDropper ?? true"
                    [saveOnOutside]="colorOption().saveOnOutside ?? true"
                    [fallbackColor]="colorOption().fallbackColor ?? '#000000ff'"
                    [presets]="colorOption().presets ?? []"
                    [position]="colorOption().position ?? 'auto'"
                    [positionOffset]="colorOption().positionOffset ?? 8"
                    [disabled]="pickerDisabled()"
                    (colorChange)="setColor($event)"
                />
                @if (field.subComponents || field.clearable) {
                    <ng-content />
                }
            </div>

            <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations" />
        </mat-form-field>
    `,
    styleUrls: ['../styles/mat-suffix.style.scss'],
    styles: `
        :host {
            display: block;
            width: 100%;
        }

        mat-form-field {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KlesFormColorComponent extends KlesFieldAbstract {
    private readonly formControl = this.group.controls[this.field.name];

    private readonly controlValue = toSignal(this.formControl.valueChanges, {
        initialValue: this.formControl.value,
    });

    private readonly controlStatus = toSignal(this.formControl.statusChanges, {
        initialValue: this.formControl.status,
    });

    readonly colorOption = computed(() => {
        const dynamicField = this.ui?.get(this.field.name)?.value();

        return dynamicField?.colorOption ?? this.field.colorOption ?? {};
    });

    readonly parsedColor = computed(() => {
        return parseColor(this.controlValue());
    });

    readonly currentColor = computed(() => {
        const value = this.controlValue();

        if (typeof value === 'string' && this.parsedColor()) {
            return value;
        }

        return this.colorOption().fallbackColor ?? '#000000ff';
    });

    readonly backgroundColor = computed(() => {
        const color = this.parsedColor();

        return color ? toCssRgba(color) : '#ffffff';
    });

    readonly foregroundColor = computed(() => {
        const color = this.parsedColor();

        return color ? readableTextColor(color) : '#000000';
    });

    readonly pickerDisabled = computed(() => {
        return this.controlStatus() === 'DISABLED' || this.colorOption().disable === true;
    });

    setColor(value: string): void {
        if (this.pickerDisabled()) {
            return;
        }

        this.formControl.setValue(value);
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
    }
}
