import { Component, computed, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldMapper } from '../decorators/component.decorator';
import { EnumType } from '../enums/type.enum';
import { KlesFieldAbstract } from './field.abstract';
import { KlesPhoneControlComponent } from '../forms/phone-control.component';
import { MatErrorMessageDirective } from '../directive/mat-error-message.directive';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';

@FieldMapper({ type: EnumType.phone })
@Component({
    selector: 'kles-form-phone',
    standalone: true,
    imports: [NgClass, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, KlesPhoneControlComponent, MatErrorMessageDirective],
    template: `
        <mat-form-field [formGroup]="group" [color]="color()" [appearance]="appearance()"
            [subscriptSizing]="field.subscriptSizing ?? 'fixed'" class="form-element field-bottom">
            @if (label()) { <mat-label>{{ label() }}</mat-label> }
            @if (icon()) { <mat-icon matPrefix>{{ icon() }}</mat-icon> }
            <kles-phone-control #phone [id]="field.id || phone.id" [ngClass]="ngClass()" [formControlName]="field.name" [options]="phoneOptions()"
                [ariaLabel]="label()" [placeholder]="placeholder() || ''" [matTooltip]="tooltip()"
                (focusin)="onFocus()" (focusout)="handlePhoneBlur($event)" />
            @if (hint()) { <mat-hint>{{ hint() }}</mat-hint> }
            @if (field.subComponents || field.clearable || isPending()) {
                <div matSuffix class="suffix">
                    @if (isPending()) { <mat-spinner diameter="21" /> }
                    <ng-content />
                </div>
            }
            <mat-error>
                @if (group.controls[field.name].hasError('phone')) { {{ phoneOptions().invalidMessage || intl.phoneInvalid }} }
                <span matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></span>
            </mat-error>
        </mat-form-field>
    `,
    styles: ['mat-form-field { width: 100%; }'],
    styleUrls: ['../styles/mat-suffix.style.scss', '../styles/mat-field-bottom.style.scss'],
})
export class KlesFormPhoneComponent extends KlesFieldAbstract {
    readonly intl = inject(KlesDynamicFormIntl);
    readonly phoneOptions = computed(() => this.resolvedFieldUi().phoneOptions ?? this.field.phoneOptions ?? {});
    @ViewChild(KlesPhoneControlComponent) private phoneControl?: KlesPhoneControlComponent;
    protected override focus(): void { this.phoneControl?.onContainerClick(); }
    handlePhoneBlur(event: FocusEvent): void {
        if (this.phoneControl?.countryPanelOpen) return;
        if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.onBlur();
    }
}
