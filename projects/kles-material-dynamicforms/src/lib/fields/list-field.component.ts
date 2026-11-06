import { afterNextRender, ChangeDetectorRef, Component, ElementRef, inject, Injector, OnDestroy, OnInit, signal, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';
import { FocusMonitor, InteractivityChecker, LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { cloneDeep } from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';
import { FieldMapper } from '../decorators/component.decorator';
import { KlesFormArray } from '../controls/array.control';
import { listFieldLimits } from '../controls/list-field-limits';
import { IKlesFieldConfig, IKlesListFieldLabels, IKlesListFieldOptions } from '../interfaces/field.config.interface';
import { KlesDynamicFieldDirective } from '../directive/dynamic-field.directive';
import { createKlesFormArrayGroup } from '../factories/form-array-group.factory';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { MatErrorFormDirective } from '../directive/mat-error-form.directive';
import { KlesFormUiArray } from '../ui/array.ui';
import { KlesFormUiGroup } from '../ui/group.ui';
import { ArrayUiState } from '../ui/ui-state/array-ui-state';
import { GroupUiState } from '../ui/ui-state/group-ui-state';

@FieldMapper({ type: 'listfield', factory: (field) => new KlesFormArray(field).create(), ui: (field) => new KlesFormUiArray(field).create() })
@Component({
    selector: 'kles-form-listfield',
    templateUrl: './list-field.component.html',
    styleUrl: './list-field.component.scss',
    standalone: true,
    imports: [NgTemplateOutlet, CdkAccordion, CdkAccordionItem, CdkDrag, CdkDragHandle, CdkDropList, MatError, MatIcon, MatButtonModule, KlesDynamicFieldDirective, ReactiveFormsModule, MatErrorFormDirective],
})
export class KlesFormListFieldComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    readonly intl = inject(KlesDynamicFormIntl);
    readonly formArray: FormArray<FormGroup<Record<string, AbstractControl>>>;
    subUi!: ArrayUiState;
    readonly collections = signal<IKlesFieldConfig[][]>([]);
    private readonly expandedRows = new WeakMap<AbstractControl, boolean>();
    private readonly rowElements = viewChildren<ElementRef<HTMLElement>>('rowElement');
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly changeDetector = inject(ChangeDetectorRef);
    private readonly interactivity = inject(InteractivityChecker);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly announcer = inject(LiveAnnouncer);
    private focusRequest = 0;

    constructor() {
        super();
        this.formArray = this.group.controls[this.field.name] as typeof this.formArray;
        this.collections.set(this.formArray.controls.map(() => this.createRowFields()));
        // Programmatic values, disabling, and async validation also update summaries and commands.
        this.formArray.events.pipe(takeUntil(this._onDestroy)).subscribe(() => this.changeDetector.markForCheck());
    }

    ngOnInit(): void {
        this.subUi = this.ui?.get(this.field.name) as ArrayUiState;
        super.ngOnInit();
    }

    get options(): IKlesListFieldOptions {
        return this.field.listFieldOptions ?? {};
    }

    get texts(): IKlesListFieldLabels {
        return {
            add: this.intl.add,
            empty: this.intl.empty,
            invalid: this.intl.listFieldInvalid,
            item: this.intl.listFieldItem,
            delete: this.intl.listFieldDelete,
            moveUp: this.intl.listFieldMoveUp,
            moveDown: this.intl.listFieldMoveDown,
            drag: this.intl.listFieldDrag,
            added: this.intl.listFieldAdded,
            removed: this.intl.listFieldRemoved,
            moved: this.intl.listFieldMoved,
            minItems: this.intl.listFieldMinItems,
            maxItems: this.intl.listFieldMaxItems,
            ...this.options.labels,
        };
    }

    get hasHeader(): boolean {
        return this.options.showHeader ?? !!(this.options.titleField || this.options.title || this.options.collapsible || this.options.reorderable);
    }

    get collapsible(): boolean {
        return this.hasHeader && this.options.collapsible === true;
    }

    get disabled(): boolean {
        return this.field.disabled === true || this.formArray.disabled;
    }

    get canAdd(): boolean {
        return !this.disabled && this.formArray.length < listFieldLimits(this.options).max;
    }

    canDelete(index: number): boolean {
        return !this.disabled && this.validIndex(index) && this.formArray.length > listFieldLimits(this.options).min;
    }

    canMove(from: number, to: number): boolean {
        return !!this.options.reorderable && !this.disabled && this.validIndex(from) && this.validIndex(to) && from !== to;
    }

    getRowUi(index: number): GroupUiState {
        return this.subUi.at(index) as GroupUiState;
    }

    getRowTitle(group: FormGroup, index: number): string {
        const configuredTitle = this.options.title;
        if (typeof configuredTitle === 'string') {
            const title = configuredTitle.trim();
            return title && title !== '[object Object]' ? this.texts.item(index, title) : this.texts.item(index);
        }
        const title = typeof configuredTitle === 'function'
            ? configuredTitle({ group, value: group.getRawValue(), index, field: this.field, context: this.context?.() ?? null })
            : group.get(this.options.titleField ?? 'label')?.value;
        return typeof title === 'string' && title.trim() && title.trim() !== '[object Object]'
            ? title
            : this.texts.item(index);
    }

    isExpanded(group: AbstractControl): boolean {
        return !this.collapsible || (this.expandedRows.get(group) ?? this.options.expanded ?? true);
    }

    setExpanded(group: AbstractControl, expanded: boolean): void {
        if (this.collapsible) this.expandedRows.set(group, expanded);
    }

    get hasLayout(): boolean {
        return (this.field.collections ?? []).some((subfield) => subfield.layout != null);
    }

    get fieldsDirection(): 'column' | 'row' | 'grid' | 'inline-grid' {
        if (this.hasLayout) return this.field.direction === 'inline-grid' ? 'inline-grid' : 'grid';
        return this.field.direction ?? 'row';
    }

    deleteField(index: number): void {
        if (!this.canDelete(index)) return;
        const title = this.getRowTitle(this.formArray.at(index), index);
        this.subUi.removeAt(index);
        this.collections.update((rows) => rows.filter((_, current) => current !== index));
        this.formArray.removeAt(index);
        this.changeDetector.markForCheck();
        this.scheduleFocus(() => this.focusCommand(Math.min(index, this.formArray.length - 1)));
        void this.announcer.announce(this.texts.removed(title));
    }

    addField(): void {
        if (!this.canAdd) return;
        const group = createKlesFormArrayGroup(this.field);
        this.expandedRows.set(group, true);
        this.subUi.push(new KlesFormUiGroup({ ...this.field, value: undefined }).create());
        this.collections.update((rows) => [...rows, this.createRowFields()]);
        this.formArray.push(group);
        this.changeDetector.markForCheck();
        this.scheduleFocus(() => {
            const index = this.formArray.controls.indexOf(group);
            if (index < 0) return;
            const row = this.rowElements()[index]?.nativeElement;
            const fields = row?.querySelector('.list-field__fields');
            const target = fields && Array.from(fields.querySelectorAll<HTMLElement>(
                'input:not([type="hidden"]), textarea, select, [klesFocusTarget], [role="combobox"], [role="radio"], [role="checkbox"], [role="switch"], [aria-pressed], [contenteditable="true"]',
            )).find((candidate) => {
                const name = candidate.closest<HTMLElement>('.list-field__field')?.dataset['fieldName'];
                return name && group.controls[name]?.enabled
                    && !candidate.matches('[readonly], [aria-readonly="true"]')
                    && this.interactivity.isTabbable(candidate);
            });
            if (target) this.focusMonitor.focusVia(target, 'program');
            else this.focusCommand(index);
        });
        void this.announcer.announce(this.texts.added(this.getRowTitle(group, this.formArray.length - 1)));
    }

    drop(event: CdkDragDrop<FormGroup[]>): void {
        if (event.previousContainer !== event.container) return;
        this.moveField(event.previousIndex, event.currentIndex);
    }

    moveField(from: number, to: number): void {
        if (!this.canMove(from, to)) return;
        const group = this.formArray.at(from);
        const ui = this.getRowUi(from);
        // Publish one final form value. Never rebuild controls or their validators/state.
        this.subUi.removeAt(from);
        this.subUi.insert(to, ui);
        this.collections.update((rows) => {
            const next = [...rows];
            moveItemInArray(next, from, to);
            return next;
        });
        this.formArray.removeAt(from, { emitEvent: false });
        this.formArray.insert(to, group);
        this.changeDetector.markForCheck();
        this.scheduleFocus(() => {
            const index = this.formArray.controls.indexOf(group);
            const handle = this.rowElements()[index]?.nativeElement.querySelector<HTMLElement>('.list-field__drag');
            if (handle) this.focusMonitor.focusVia(handle, 'keyboard');
        });
        void this.announcer.announce(this.texts.moved(this.getRowTitle(group, to), to + 1, this.formArray.length));
    }

    moveWithKeyboard(event: KeyboardEvent, index: number): void {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        this.moveField(index, index + (event.key === 'ArrowUp' ? -1 : 1));
    }

    ngOnDestroy(): void {
        this.focusRequest++;
        super.ngOnDestroy();
    }

    private validIndex(index: number): boolean {
        return Number.isInteger(index) && index >= 0 && index < this.formArray.length;
    }

    private scheduleFocus(callback: () => void): void {
        const request = ++this.focusRequest;
        afterNextRender(() => {
            if (request === this.focusRequest) callback();
        }, { injector: this.injector });
    }

    private focusCommand(index: number): void {
        const row = this.rowElements()[index]?.nativeElement;
        const candidates = [
            ...Array.from(row?.querySelectorAll<HTMLElement>('.list-field__delete, .list-field__toggle, .list-field__actions button') ?? []),
            this.element.nativeElement.querySelector<HTMLElement>('.list-field__add'),
        ];
        const target = candidates.find((candidate) => candidate && this.interactivity.isTabbable(candidate))
            ?? this.element.nativeElement.querySelector<HTMLElement>('.list-field');
        if (target) this.focusMonitor.focusVia(target, 'program');
    }

    private createRowFields(): IKlesFieldConfig[] {
        return cloneDeep(this.field.collections ?? []).map((field) => ({
            ...field,
            subscriptSizing: field.subscriptSizing ?? 'dynamic',
        }));
    }

    getGridColumn(field: IKlesFieldConfig): string {
        const span = field.layout?.colSpan ?? 12;
        return field.layout?.colStart ? field.layout.colStart + ' / span ' + span : 'span ' + span;
    }

    getGridRow(field: IKlesFieldConfig): string | undefined {
        const span = field.layout?.rowSpan;
        const start = field.layout?.rowStart;
        if (start && span) return start + ' / span ' + span;
        if (start) return String(start);
        return span ? 'span ' + span : undefined;
    }
}
