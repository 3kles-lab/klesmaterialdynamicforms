import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { defer, Observable, of } from 'rxjs';

import { FieldMapper } from '../decorators/component.decorator';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFieldAbstract } from './field.abstract';
import { KlesActionMenuEntry, KlesActionMenuPanelComponent } from './action-menu-panel.component';

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

    /** Sous-menu récursif. Sans enfant visible, l'entrée est désactivée. Seules les feuilles déclenchent onAction. */
    options?: KlesActionMenuItem<TContext>[];
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
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, KlesActionMenuPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kles-action-menu-panel
            #actionMenu
            [items]="menuActions()"
            [xPosition]="actionField.menuXPosition || 'before'"
            [yPosition]="actionField.menuYPosition || 'below'"
            (selected)="execute($event.action, $event.event)"
        />
        <button
            matIconButton
            type="button"
            [attr.id]="field.id"
            [attr.aria-label]="ariaLabel()"
            [disabled]="disabled()"
            [matTooltip]="tooltip() || ''"
            [matMenuTriggerFor]="actionMenu.menu"
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

    private readonly groupEvents = toSignal(this.group.events);

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

    readonly menuActions = computed(() => this.resolveMenuActions(this.actions()));

    readonly ariaLabel = computed(() => this.label() || this.tooltip() || 'Actions');

    onTriggerClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    isDisabled(action: KlesActionMenuItem<TContext>): boolean {
        return this.disabled() || this.resolveCondition(action.disabled, false);
    }

    execute(action: KlesActionMenuItem<TContext>, event: MouseEvent): void {
        if (action.options || this.isDisabled(action)) {
            event.stopPropagation();
            return;
        }

        this.triggerAction(action.id, event, action);
    }

    private resolveMenuActions(actions: KlesActionMenuItem<TContext>[], parentDisabled = false): KlesActionMenuEntry<TContext>[] {
        return actions
            .filter((action) => this.resolveCondition(action.visible, true))
            .map((action) => {
                const disabled = parentDisabled || this.isDisabled(action);
                const options = action.options ? this.resolveMenuActions(action.options, disabled) : undefined;
                return {
                    action,
                    options,
                    disabled: disabled || options?.length === 0,
                };
            });
    }

    private resolveCondition(condition: KlesActionMenuCondition<TContext> | undefined, defaultValue: boolean): boolean {
        if (typeof condition === 'function') {
            this.groupEvents();
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
