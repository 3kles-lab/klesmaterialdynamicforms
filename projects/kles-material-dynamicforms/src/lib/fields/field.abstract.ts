import { AfterViewInit, Directive, HostBinding, OnDestroy, OnInit, Signal, ViewContainerRef, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IKlesField } from '../interfaces/field.interface';
import type { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FIELD, GROUP, SIBLING_FIELDS, GROUP_UI, FIELD_CONTEXT } from '../token';
import { FormGroup } from '@angular/forms';
import { GroupUiState } from '../ui/ui-state/group-ui-state';

@Directive()
export abstract class KlesFieldAbstract<TContext = unknown> implements IKlesField, OnInit, AfterViewInit, OnDestroy {
    public readonly field = inject<IKlesFieldConfig>(FIELD);
    public readonly group = inject<FormGroup<any>>(GROUP);
    public readonly siblingFields = inject<IKlesFieldConfig[]>(SIBLING_FIELDS);
    public readonly ui = inject<GroupUiState>(GROUP_UI, { optional: true });
    public readonly context = inject(FIELD_CONTEXT, { optional: true }) as Signal<TContext | null> | null;

    protected readonly fieldUi = computed(() => this.ui?.get(this.field.name)?.value());

    public readonly appearance = computed(() => this.fieldUi()?.appearance);
    public readonly inputType = computed(() => this.fieldUi()?.inputType);
    public readonly min = computed(() => this.fieldUi()?.min);
    public readonly max = computed(() => this.fieldUi()?.max);
    public readonly maxLength = computed(() => this.fieldUi()?.maxLength ?? 524288);
    public readonly step = computed(() => this.fieldUi()?.step);
    public readonly ngClass = computed(() => this.fieldUi()?.ngClass);
    public readonly ngStyle = computed(() => this.fieldUi()?.ngStyle);
    public readonly indeterminate = computed(() => this.fieldUi()?.indeterminate ?? false);
    public readonly color = computed(() => this.fieldUi()?.color);
    public readonly icon = computed(() => this.fieldUi()?.icon);
    public readonly iconSvg = computed(() => this.fieldUi()?.iconSvg);
    public readonly buttonAppearance = computed(() => this.fieldUi()?.buttonAppearance);
    public readonly label = computed(() => this.fieldUi()?.label ?? this.field.label);
    public readonly hint = computed(() => this.fieldUi()?.hint ?? this.field.hint);
    public readonly placeholder = computed(() => this.fieldUi()?.placeholder ?? this.field.placeholder);
    public readonly tooltip = computed(() => this.fieldUi()?.tooltip ?? this.field.tooltip);
    public readonly imageUrl = computed(() => this.fieldUi()?.imageUrl);
    public readonly imageAlt = computed(() => this.fieldUi()?.imageAlt ?? this.label());

    protected readonly viewRef = inject(ViewContainerRef);

    @HostBinding('attr.klesDirective') directive: any;

    protected _onDestroy = new Subject<void>();

    constructor() {
        if (this.field.directive) {
            this.directive = new this.field.directive(this.viewRef, this);
        }
    }

    ngOnInit(): void {
        if (this.field.valueChanges) {
            this.field.valueChanges(this.field, this.group, this.siblingFields);
        }

        this.group.controls[this.field.name]?.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe((val) => {
            if (this.field.valueChanges) {
                this.field.valueChanges(this.field, this.group, this.siblingFields, val);
            }
        });

        if (this.directive) {
            this.directive.ngOnInit();
        }
    }

    ngAfterViewInit(): void {
        if (this.directive && this.directive.ngAfterViewInit) {
            this.directive?.ngAfterViewInit();
        }

        if (this.field.autofocus) {
            setTimeout(() => {
                (<any>this.group.controls[this.field.name])?.nativeElement.focus();
            });
        }
    }

    ngOnDestroy(): void {
        this.directive?.ngOnDestroy();
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    applyPipeTransform() {
        if (this.group && this.field) {
            const control = this.group.controls[this.field.name];
            if (control) {
                const val = this.group.controls[this.field.name].value;
                if (this.field.pipeTransform) {
                    this.field.pipeTransform.forEach((p) => {
                        let pipeVal = control.value;
                        if (p.options) {
                            p.options.forEach((opt) => {
                                pipeVal = p.pipe.transform(val, opt);
                            });
                        } else {
                            pipeVal = p.pipe.transform(val);
                        }
                        control.patchValue(pipeVal, { onlySelf: true, emitEvent: false });
                    });
                }
            }
        }
    }

    isPending() {
        return this.group.controls[this.field.name].pending || this.field.pending;
    }

    onFocus() {
        if (this.field?.onFocus) {
            this.field.onFocus(this.field, this.group);
        }
    }

    onBlur() {
        if (this.field?.onBlur) {
            this.field.onBlur(this.field, this.group);
        }
    }

    public triggerAction(actionId: string, originalEvent: Event, value?: unknown): void {
        originalEvent.stopPropagation();

        this.field.onAction?.({
            actionId,
            value,
            context: this.context?.() ?? null,
            field: this.field,
            group: this.group,
            originalEvent,
        });
    }
}
