import { ChangeDetectionStrategy, Component, forwardRef, input, output, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

import type { KlesActionMenuItem } from './action-menu.component';

export interface KlesActionMenuEntry<TContext = unknown> {
    action: KlesActionMenuItem<TContext>;
    disabled: boolean;
    options?: KlesActionMenuEntry<TContext>[];
}

export interface KlesActionMenuSelection<TContext = unknown> {
    action: KlesActionMenuItem<TContext>;
    event: MouseEvent;
}

/** Internal recursive panel. Items must belong to their own Material menu for keyboard navigation. */
@Component({
    selector: 'kles-action-menu-panel',
    standalone: true,
    imports: [MatDividerModule, MatIconModule, MatMenuModule, forwardRef(() => KlesActionMenuPanelComponent)],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mat-menu #menu="matMenu" [xPosition]="xPosition()" [yPosition]="yPosition()">
            <ng-template matMenuContent>
                @for (entry of items(); track entry.action.id) {
                    @if (entry.action.dividerBefore) {
                        <mat-divider />
                    }

                    @if (entry.options) {
                        <kles-action-menu-panel #submenu [items]="entry.options" (selected)="selected.emit($event)" />
                        <button mat-menu-item type="button" [disabled]="entry.disabled" [class.kles-action-menu__warn]="entry.action.color === 'warn'" [matMenuTriggerFor]="submenu.menu">
                            @if (entry.action.iconSvg) {
                                <mat-icon [svgIcon]="entry.action.iconSvg" />
                            } @else if (entry.action.icon) {
                                <mat-icon>{{ entry.action.icon }}</mat-icon>
                            }
                            <span>{{ entry.action.label }}</span>
                        </button>
                    } @else {
                        <button mat-menu-item type="button" [disabled]="entry.disabled" [class.kles-action-menu__warn]="entry.action.color === 'warn'" (click)="select(entry, $event)">
                            @if (entry.action.iconSvg) {
                                <mat-icon [svgIcon]="entry.action.iconSvg" />
                            } @else if (entry.action.icon) {
                                <mat-icon>{{ entry.action.icon }}</mat-icon>
                            }
                            <span>{{ entry.action.label }}</span>
                        </button>
                    }
                }
            </ng-template>
        </mat-menu>
    `,
    styles: `
        .kles-action-menu__warn {
            color: var(--mat-sys-error);
        }

        .kles-action-menu__warn mat-icon {
            color: var(--mat-sys-error);
        }
    `,
})
export class KlesActionMenuPanelComponent<TContext = unknown> {
    readonly items = input.required<KlesActionMenuEntry<TContext>[]>();
    readonly xPosition = input<'before' | 'after'>('after');
    readonly yPosition = input<'above' | 'below'>('below');
    readonly selected = output<KlesActionMenuSelection<TContext>>();

    @ViewChild(MatMenu, { static: true }) menu!: MatMenu;

    select(entry: KlesActionMenuEntry<TContext>, event: MouseEvent): void {
        if (entry.disabled) {
            event.stopPropagation();
            return;
        }

        this.selected.emit({ action: entry.action, event });
        // triggerAction stops DOM propagation, so close through Material's parent-menu chain.
        this.menu.closed.emit('click');
    }
}
