import { AfterViewInit, Directive, HostBinding, OnDestroy, OnInit, ViewContainerRef, computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IKlesField } from '../interfaces/field.interface';
import type { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FIELD, GROUP, SIBLING_FIELDS, GROUP_UI } from '../token';
import { FormGroup } from '@angular/forms';
import { GroupUiState } from '../ui/ui-state/group-ui-state';


@Directive()
export abstract class KlesFieldAbstract implements IKlesField, OnInit, AfterViewInit, OnDestroy {
    public readonly field = inject<IKlesFieldConfig>(FIELD);
    public readonly group = inject<FormGroup<any>>(GROUP);
    public readonly siblingFields = inject<IKlesFieldConfig[]>(SIBLING_FIELDS);
    public readonly ui = inject<GroupUiState>(GROUP_UI, { optional: true });

    public appearance = computed(() => this.ui?.get(this.field.name)?.value()?.appearance);
    public inputType = computed(() => this.ui?.get(this.field.name)?.value()?.inputType);
    public min = computed(() => this.ui?.get(this.field.name)?.value()?.min);
    public max = computed(() => this.ui?.get(this.field.name)?.value()?.max);
    public maxLength = computed(() => this.ui?.get(this.field.name)?.value()?.maxLength ?? 524288);
    public step = computed(() => this.ui?.get(this.field.name)?.value()?.step);
    public ngClass = computed(() => this.ui?.get(this.field.name)?.value()?.ngClass);
    public ngStyle = computed(() => this.ui?.get(this.field.name)?.value()?.ngStyle);
    public indeterminate = computed(() => this.ui?.get(this.field.name)?.value()?.indeterminate ?? false);
    public color = computed(() => this.ui?.get(this.field.name)?.value()?.color);
    public icon = computed(() => this.ui?.get(this.field.name)?.value()?.icon);
    public iconSvg = computed(() => this.ui?.get(this.field.name)?.value()?.iconSvg);
    public buttonAppearance = computed(() => this.ui?.get(this.field.name)?.value()?.buttonAppearance);

    protected readonly viewRef = inject(ViewContainerRef);

    @HostBinding('attr.klesDirective') directive;

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
}
