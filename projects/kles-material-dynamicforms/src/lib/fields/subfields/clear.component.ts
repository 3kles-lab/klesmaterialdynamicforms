import { Component, inject, OnDestroy, Signal, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IKlesClearControl } from '../../interfaces/clear-control.interface';
import { IKlesFieldConfig } from '../../interfaces/field.config.interface';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { FIELD, GROUP, SIBLING_FIELDS } from '../../token';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, startWith, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'kles-form-clear',
    template: `
        <button [disabled]="disabled()" matIconButton aria-label="Clear" type="button" (click)="clear($event)">
            <mat-icon>close</mat-icon>
        </button>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIcon, MatIconButton],
})
export class KlesFormClearComponent implements IKlesClearControl, OnDestroy {
    readonly field = inject<IKlesFieldConfig>(FIELD);
    readonly group = inject<FormGroup<any>>(GROUP);
    readonly siblingFields = inject<IKlesFieldConfig[]>(SIBLING_FIELDS);

    private _onDestroy = new Subject<void>();

    disabled: Signal<boolean>;

    constructor() {
        const control = this.group.controls[this.field.name];

        this.disabled = toSignal(
            combineLatest([
                control.valueChanges.pipe(
                    startWith(control.value),
                    map((value) => {
                        return !this.isPresent(value);
                    }),
                ),
                control.statusChanges.pipe(
                    startWith(control.status),
                    map((status) => status === 'DISABLED'),
                ),
            ]).pipe(
                takeUntil(this._onDestroy),
                map(([empty, disabled]) => {
                    return empty || disabled;
                }),
            ),
            { initialValue: true },
        );
    }

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    clear(event: MouseEvent): void {
        event.stopPropagation();
        this.group.controls[this.field.name].reset();
    }

    private isPresent<T>(value: T | null | undefined): value is T {
        if (value == null) return false;

        if (typeof value === 'string') {
            return value.length > 0;
        }

        if (Array.isArray(value)) {
            return value.length > 0;
        }

        if (value instanceof Map || value instanceof Set) {
            return value.size > 0;
        }

        return true;
    }
}
