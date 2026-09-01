import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, OnDestroy, OnInit, viewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';

/** Internal search input used by the Kles select field. */
@Component({
    selector: 'kles-select-search-input',
    standalone: true,
    imports: [ReactiveFormsModule, MatIconButton, MatIcon, MatProgressSpinner],
    template: `
        <div class="kles-select-search-row">
            <mat-icon class="kles-select-search-icon" aria-hidden="true">search</mat-icon>
            <input
                #searchInput
                class="kles-select-search-input"
                type="search"
                autocomplete="off"
                tabindex="-1"
                [formControl]="control()"
                [placeholder]="placeholder()"
                [attr.aria-label]="ariaLabel()"
                (keydown)="onKeydown($event)"
            />
            @if (searching()) {
                <mat-spinner class="kles-select-search-spinner" diameter="16" />
            } @else if (control().value) {
                <button
                    mat-icon-button
                    type="button"
                    class="kles-select-search-clear"
                    [attr.aria-label]="clearAriaLabel()"
                    (mousedown)="preserveInputFocus($event)"
                    (click)="clearSearch($event)"
                >
                    <mat-icon>close</mat-icon>
                </button>
            }
        </div>
    `,
    styles: [
        `
            kles-select-search-input {
                display: block;
                width: 100%;
            }

            .kles-select-panel .kles-select-search-row {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                min-height: 48px;
                background: var(--mat-sys-surface-container, var(--mat-select-panel-background-color, white));
                box-shadow: inset 0 -1px 0 var(--mat-sys-outline-variant, currentColor);
            }

            .kles-select-panel .kles-select-search-icon {
                position: absolute;
                inset-inline-start: 14px;
                width: 20px;
                height: 20px;
                color: var(--mat-sys-on-surface-variant, currentColor);
                font-size: 20px;
                line-height: 20px;
                pointer-events: none;
            }

            .kles-select-panel .kles-select-search-input {
                box-sizing: border-box;
                width: 100%;
                height: 47px;
                padding: 0 44px;
                border: 0;
                outline: 0;
                color: currentColor;
                background: transparent;
                font: inherit;
            }

            .kles-select-panel .kles-select-search-input::placeholder {
                color: var(--mat-sys-on-surface-variant, currentColor);
                opacity: 0.8;
            }

            .kles-select-panel .kles-select-search-input::-webkit-search-cancel-button {
                display: none;
            }

            .kles-select-panel .kles-select-search-clear {
                position: absolute;
                inset-inline-end: 4px;
                width: 40px;
                height: 40px;
                color: currentColor;
                cursor: pointer;
            }

            .kles-select-panel .kles-select-search-spinner {
                position: absolute;
                inset-inline-end: 16px;
            }

            .kles-select-panel .mat-mdc-option.kles-select-search-option {
                position: sticky;
                top: -8px;
                z-index: 2;
                min-height: 48px;
                margin-top: -8px;
                padding: 0;
                opacity: 1;
                pointer-events: all;
                background: var(--mat-sys-surface-container, var(--mat-select-panel-background-color, white));
            }

            .kles-select-panel .mat-mdc-option.kles-select-search-option .mat-pseudo-checkbox {
                display: none;
            }

            .kles-select-panel .mat-mdc-option.kles-select-search-option .mdc-list-item__primary-text {
                width: 100%;
                opacity: 1;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    encapsulation: ViewEncapsulation.None,
})
export class KlesSelectSearchInputComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly control = input.required<FormControl<string | null>>();
    readonly placeholder = input('');
    readonly ariaLabel = input('Search options');
    readonly clearAriaLabel = input('Clear search');
    readonly searching = input(false);

    private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('searchInput');

    private readonly destroyRef = inject(DestroyRef);
    private readonly matSelect = inject(MatSelect);
    private readonly matOption = inject(MatOption);
    private removePanelKeyboardGuard?: () => void;

    ngOnInit(): void {
        this.matOption.disabled = true;

        const optionElement = this.matOption._getHostElement();
        optionElement.classList.add('kles-select-search-option');
        optionElement.setAttribute('role', 'presentation');
    }

    ngAfterViewInit(): void {
        this.matSelect.openedChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((opened) => {
            if (opened) {
                setTimeout(() => {
                    this.focusInput();
                    this.installPanelKeyboardGuard();
                });
            } else {
                this.removePanelKeyboardGuard?.();
                this.removePanelKeyboardGuard = undefined;
            }
        });
    }

    ngOnDestroy(): void {
        this.removePanelKeyboardGuard?.();
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key.length === 1) {
            event.stopPropagation();
        }

        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
        }

        if (this.matSelect.multiple && event.key === 'Enter') {
            setTimeout(() => this.focusInput());
        }
    }

    preserveInputFocus(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    clearSearch(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.control().setValue('');
        this.focusInput();
    }

    private focusInput(): void {
        const panel = this.matSelect.panel?.nativeElement as HTMLElement | undefined;
        const inputElement = this.inputElement();
        if (!panel || !inputElement) {
            return;
        }

        const scrollTop = panel.scrollTop;
        inputElement.nativeElement.focus();
        panel.scrollTop = scrollTop;
    }

    /**
     * Material 21 renders the panel inline. Without this listener the panel and
     * the mat-select host both process the same keydown and skip an option.
     */
    private installPanelKeyboardGuard(): void {
        this.removePanelKeyboardGuard?.();

        const panel = this.matSelect.panel?.nativeElement as HTMLElement | undefined;
        if (!panel) {
            return;
        }

        const handler = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                event.stopPropagation();
            }
        };

        panel.addEventListener('keydown', handler);
        this.removePanelKeyboardGuard = () => panel.removeEventListener('keydown', handler);
    }
}
