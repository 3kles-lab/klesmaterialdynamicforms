import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KlesFieldAbstract } from './field.abstract';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-kles-form-tile',
    standalone: true,
    imports: [CommonModule, MatTooltipModule, MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="kles-tile" [ngClass]="ngClass()" [ngStyle]="ngStyle()" [matTooltip]="tooltip()">
            @if (imageUrl()) {
                <img class="kles-tile__image" [src]="imageUrl()" [alt]="imageAlt()" />
            } @else if (icon()) {
                <mat-icon class="kles-tile__icon">
                    {{ icon() }}
                </mat-icon>
            }

            <div class="kles-tile__content">
                @if (displayValue(); as value) {
                    <div class="kles-tile__label">
                        {{ value }}
                    </div>
                }

                @if (hint()) {
                    <div class="kles-tile__hint">
                        {{ hint() }}
                    </div>
                }
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: inherit;
            text-align:left;
        }

        .kles-tile {
            display: flex;
            align-items: center;
            min-width: 0;
            gap: 12px;
            padding: 8px;
        }

        .kles-tile__image,
        .kles-tile__icon {
            width: 36px;
            height: 36px;
            flex: 0 0 36px;
        }

        .kles-tile__icon {
            display: flex;
            align-items: center;
            justify-content: center;

            color: var(--mat-sys-primary);

            font-size: 28px;
        }

        .kles-tile__image {
            object-fit: contain;
        }

        .kles-tile__content {
            display: flex;
            flex-direction: column;
            min-width: 0;
            gap: 2px;
        }

        .kles-tile__label {
            overflow: hidden;
            color: var(--mat-sys-on-surface);
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            text-overflow: ellipsis;
        }

        .kles-tile__hint {
            overflow: hidden;
            color: var(--mat-sys-on-surface-variant);
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            text-overflow: ellipsis;
        }
    `,
})
export class KlesFormTileComponent extends KlesFieldAbstract {
    private readonly control = this.group.controls[this.field.name];

    private readonly controlValue = toSignal(this.control.valueChanges, {
        initialValue: this.control.value,
    });

    readonly formattedValue = computed(() => {
        const value = this.controlValue();

        if (value == null) {
            return '';
        }

        if (this.field.displayWith) {
            return this.field.displayWith(value) ?? '';
        }

        if (this.field.property && typeof value === 'object') {
            return String(value[this.field.property] ?? '');
        }

        return String(value);
    });

    readonly displayValue = computed(() => this.formattedValue() || this.label() || '');
}
