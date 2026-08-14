import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KlesFieldAbstract } from './field.abstract';

@Component({
    selector: 'app-kles-form-tile',
    standalone: true,
    imports: [CommonModule, MatTooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="kles-tile" [ngClass]="ngClass()" [ngStyle]="ngStyle()" [matTooltip]="tooltip()">
            @if (imageUrl()) {
                <img class="kles-tile__image" [src]="imageUrl()" [alt]="imageAlt()" />
            }

            <div class="kles-tile__content">
                @if (label()) {
                    <div class="kles-tile__label">
                        {{ label() }}
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
            display: block;
            width: 100%;
        }

        .kles-tile {
            display: flex;
            align-items: center;
            min-width: 0;
            gap: 12px;
            padding: 8px;
        }

        .kles-tile__image {
            width: 36px;
            height: 36px;
            flex: 0 0 36px;
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
            white-space: nowrap;
        }

        .kles-tile__hint {
            overflow: hidden;
            color: var(--mat-sys-on-surface-variant);
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
})
export class KlesFormTileComponent extends KlesFieldAbstract {}
