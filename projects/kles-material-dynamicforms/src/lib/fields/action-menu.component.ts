import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { defer, Observable, of } from 'rxjs';

import { FieldMapper } from '../decorators/component.decorator';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFieldAbstract } from './field.abstract';

/**
 * Condition statique ou calculée à partir du contexte du field.
 */
export type KlesActionMenuCondition<TContext = unknown> = boolean | ((context: TContext | null, field: IKlesFieldConfig, group: UntypedFormGroup) => boolean);

/**
 * Configuration d'une entrée du menu.
 *
 * Le callback n'est pas placé ici :
 * toutes les actions sont gérées par field.onAction.
 */
export interface KlesActionMenuItem<TContext = unknown> {
    id: string;
    label: string;

    icon?: string;
    iconSvg?: string;

    visible?: KlesActionMenuCondition<TContext>;
    disabled?: KlesActionMenuCondition<TContext>;

    dividerBefore?: boolean;

    color?: 'default' | 'warn';
}

/**
 * Configuration spécialisée du field action-menu.
 */
export interface KlesActionMenuFieldConfig<TContext = unknown> extends IKlesFieldConfig {
    options?: KlesActionMenuItem<TContext>[] | Observable<KlesActionMenuItem<TContext>[]> | ((value?: string, group?: { [key: string]: any }) => Observable<KlesActionMenuItem<TContext>[]>);

    menuXPosition?: 'before' | 'after';
    menuYPosition?: 'above' | 'below';
}

@FieldMapper({
    type: 'actionMenu',
})
@Component({
    selector: 'kles-form-action-menu',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, MatTooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button
            matIconButton
            type="button"
            [attr.id]="field.id"
            [attr.aria-label]="ariaLabel()"
            [disabled]="disabled()"
            [matTooltip]="tooltip() || ''"
            [matMenuTriggerFor]="actionMenu"
            [ngClass]="ngClass()"
            [ngStyle]="ngStyle()"
            (click)="onTriggerClick($event)"
        >
            @if (iconSvg()) {
                <mat-icon [svgIcon]="iconSvg()!" />
            } @else {
                <mat-icon>
                    {{ icon() || 'more_vert' }}
                </mat-icon>
            }
        </button>

        <mat-menu #actionMenu="matMenu" [xPosition]="actionField.menuXPosition || 'before'" [yPosition]="actionField.menuYPosition || 'below'">
            @for (action of visibleActions(); track action.id) {
                @if (action.dividerBefore) {
                    <mat-divider />
                }

                <button mat-menu-item type="button" [disabled]="isDisabled(action)" [class.kles-action-menu__warn]="action.color === 'warn'" (click)="execute(action, $event)">
                    @if (action.iconSvg) {
                        <mat-icon [svgIcon]="action.iconSvg" />
                    } @else if (action.icon) {
                        <mat-icon>
                            {{ action.icon }}
                        </mat-icon>
                    }

                    <span>
                        {{ action.label }}
                    </span>
                </button>
            }
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
export class KlesFormActionMenuComponent<TContext = unknown> extends KlesFieldAbstract<TContext> {
    /**
     * Configuration du field avec le typage spécialisé.
     */
    readonly actionField = this.field as KlesActionMenuFieldConfig<TContext>;

    private readonly control = this.group.controls[this.field.name];

    private readonly controlStatus = toSignal(this.control.statusChanges, {
        initialValue: this.control.status,
    });

    /**
     * Options statiques ou asynchrones.
     */
    private readonly actionsSource$ = defer(() => this.resolveOptions());

    readonly actions = toSignal(this.actionsSource$, {
        initialValue: [] as KlesActionMenuItem<TContext>[],
    });

    readonly disabled = computed(() => {
        this.controlStatus();
        return this.control.disabled;
    });

    readonly visibleActions = computed(() => this.actions().filter((action) => this.resolveCondition(action.visible, true)));

    readonly ariaLabel = computed(() => this.label() || this.tooltip() || 'Actions');

    onTriggerClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    isDisabled(action: KlesActionMenuItem<TContext>): boolean {
        return this.disabled() || this.resolveCondition(action.disabled, false);
    }

    execute(action: KlesActionMenuItem<TContext>, event: MouseEvent): void {
        if (this.isDisabled(action)) {
            event.stopPropagation();
            return;
        }

        this.triggerAction(action.id, event, action);
    }

    private resolveCondition(condition: KlesActionMenuCondition<TContext> | undefined, defaultValue: boolean): boolean {
        if (typeof condition === 'function') {
            return condition(this.context?.() ?? null, this.field, this.group);
        }

        return condition ?? defaultValue;
    }

    private resolveOptions(): Observable<KlesActionMenuItem<TContext>[]> {
        const options = this.actionField.options;

        if (options instanceof Observable) {
            return options;
        }

        if (typeof options === 'function') {
            return options(undefined, this.group.getRawValue());
        }

        return of(options ?? []);
    }
}
