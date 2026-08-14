import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EnumType } from '../enums/type.enum';
import { FieldMapper } from '../decorators/component.decorator';
import { IKlesStatusDefinition } from '../interfaces/field.config.interface';
import { KlesFieldAbstract } from './field.abstract';

@FieldMapper({
    type: EnumType.status,
})
@Component({
    selector: 'kles-form-status',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span [ngClass]="ngClass()" [ngStyle]="ngStyle()">
            @if (pending()) {
                <mat-spinner mode="indeterminate" diameter="18" />
            } @else if (resolvedStatus(); as status) {
                <span
                    class="kles-status"
                    [class.kles-status--chip]="statusAppearance() === 'chip'"
                    [class.kles-status--badge]="statusAppearance() === 'badge'"
                    [class.kles-status--text]="statusAppearance() === 'text'"
                    [class.kles-status--neutral]="status.tone === 'neutral'"
                    [class.kles-status--info]="status.tone === 'info'"
                    [class.kles-status--success]="status.tone === 'success'"
                    [class.kles-status--warning]="status.tone === 'warning'"
                    [class.kles-status--error]="status.tone === 'error'"
                    [class.kles-status--disabled]="disabled()"
                    [ngClass]="status.ngClass"
                    [matTooltip]="status.tooltip || tooltip() || ''"
                    [attr.aria-label]="status.ariaLabel || status.label"
                >
                    @if (status.iconSvg) {
                        <mat-icon class="kles-status__icon" [svgIcon]="status.iconSvg" />
                    } @else if (status.icon) {
                        <mat-icon class="kles-status__icon">
                            {{ status.icon }}
                        </mat-icon>
                    } @else if (showDot()) {
                        <span class="kles-status__dot" aria-hidden="true"></span>
                    }

                    <span class="kles-status__label">
                        {{ status.label }}
                    </span>
                </span>
            }
        </span>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: inherit;
        }

        .kles-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            box-sizing: border-box;
            color: var(--kles-status-color, var(--mat-sys-on-surface-variant));
            background: var(--kles-status-container, var(--mat-sys-surface-container-high));
        }

        .kles-status--chip {
            min-height: 28px;
            padding: 3px 10px;
            border-radius: 999px;
            font: var(--mat-sys-label-medium);
        }

        .kles-status--badge {
            min-height: 22px;
            padding: 2px 7px;
            border-radius: 4px;
            font: var(--mat-sys-label-small);
        }

        .kles-status--text {
            padding: 0;
            border-radius: 0;
            background: transparent;
        }

        .kles-status__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            width: 20px;
            height: 20px;
            flex: 0 0 20px;
            line-height: 20px;

            overflow: visible;
            vertical-align: middle;
        }

        .kles-status__icon svg {
            width: 100%;
            height: 100%;
            overflow: visible;
        }

        .kles-status__dot {
            width: 8px;
            height: 8px;
            flex: 0 0 8px;

            border-radius: 50%;
            background: currentColor;
        }

        .kles-status__label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .kles-status--disabled {
            opacity: 0.56;
        }

        .kles-status--neutral {
            --kles-status-color: var(--mat-sys-on-surface-variant);
            --kles-status-container: var(--mat-sys-surface-container-high);
        }

        .kles-status--info {
            --kles-status-color: var(--mat-sys-on-primary-container);
            --kles-status-container: var(--mat-sys-primary-container);
        }

        .kles-status--success {
            --kles-status-color: var(--kles-status-success-color, #1b5e20);
            --kles-status-container: var(--kles-status-success-container, #d7f5df);
        }

        .kles-status--warning {
            --kles-status-color: var(--kles-status-warning-color, #7a4f00);
            --kles-status-container: var(--kles-status-warning-container, #ffecb3);
        }

        .kles-status--error {
            --kles-status-color: var(--mat-sys-on-error-container);
            --kles-status-container: var(--mat-sys-error-container);
        }
    `,
})
export class KlesFormStatusComponent<TContext = unknown> extends KlesFieldAbstract<TContext> {
    private readonly control = this.group.controls[this.field.name];

    private readonly controlValue = toSignal(this.control.valueChanges.pipe(startWith(this.control.value)), {
        initialValue: this.control.value,
    });

    private readonly controlStatus = toSignal(this.control.statusChanges.pipe(startWith(this.control.status)), {
        initialValue: this.control.status,
    });

    readonly statusAppearance = computed(() => this.field.statusOptions?.appearance ?? 'chip');

    readonly showDot = computed(() => this.field.statusOptions?.showDot ?? true);

    readonly disabled = computed(() => {
        this.controlStatus();

        return this.control.disabled;
    });

    readonly pending = computed(() => {
        this.controlStatus();

        return this.control.pending || this.field.pending === true;
    });

    readonly resolvedStatus = computed<IKlesStatusDefinition | null>(() => {
        const value = this.controlValue();
        const options = this.field.statusOptions;

        if (options?.resolve) {
            return options.resolve(value, this.context?.() ?? null, this.field, this.group);
        }

        const key = this.resolveStatusKey(value);

        const configuredStatus = options?.values?.[key];

        if (configuredStatus) {
            return {
                tone: 'neutral',
                ...configuredStatus,
            };
        }

        if (options?.fallback) {
            return {
                tone: 'neutral',
                ...options.fallback,
            };
        }

        if (value === null || value === undefined || value === '') {
            return null;
        }

        return {
            label: this.resolveDefaultLabel(value),
            tone: 'neutral',
        };
    });

    private resolveStatusKey(value: any): string {
        if (this.field.property && value !== null && typeof value === 'object') {
            return String(value[this.field.property]);
        }

        return String(value);
    }

    private resolveDefaultLabel(value: any): string {
        if (this.field.property && value !== null && typeof value === 'object') {
            return String(value[this.field.property] ?? '');
        }

        return String(value);
    }
}
