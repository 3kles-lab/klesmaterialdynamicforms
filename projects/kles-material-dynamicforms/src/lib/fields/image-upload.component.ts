import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { FieldMapper } from '../decorators/component.decorator';
import { KlesDynamicFormIntl } from '../dynamic-form-intl';
import { EnumType } from '../enums/type.enum';
import { KlesFileControlValue, KlesFileValue } from '../forms/file-control.component';
import { KlesFieldAbstract } from './field.abstract';

const DEFAULT_MAX_FILE_SIZE = 2 * 1024 * 1024;
const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

@FieldMapper({ type: EnumType.imageUpload })
@Component({
    selector: 'kles-form-image-upload',
    standalone: true,
    imports: [CommonModule, MatButton, MatIcon],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="kles-image-upload" [ngClass]="ngClass()" [ngStyle]="ngStyle()">
            <div class="kles-image-upload__preview">
                @if (previewUrl(); as preview) {
                    <img [src]="preview" [alt]="imageAlt()" />
                } @else {
                    <mat-icon aria-hidden="true">{{ options().emptyIcon ?? 'person' }}</mat-icon>
                }
            </div>

            <div class="kles-image-upload__content">
                <div class="kles-image-upload__title">
                    <mat-icon aria-hidden="true">{{ icon() || 'photo_camera' }}</mat-icon>
                    <span>{{ label() }}</span>
                </div>

                @if (hint()) {
                    <p class="kles-image-upload__hint">{{ hint() }}</p>
                }

                <input
                    #fileInput
                    type="file"
                    hidden
                    [attr.id]="field.id"
                    [accept]="accept()"
                    [disabled]="disabled()"
                    [attr.aria-label]="options().changeLabel ?? intl.imageUploadChange"
                    (change)="selectFile($event)"
                />

                <div class="kles-image-upload__actions">
                    <button matButton="outlined" type="button" [disabled]="disabled()" (click)="openFilePicker()">
                        <mat-icon>{{ options().uploadIcon ?? 'upload' }}</mat-icon>
                        {{ options().changeLabel ?? intl.imageUploadChange }}
                    </button>
                    <button matButton type="button" [disabled]="disabled() || !hasImage()" (click)="deleteImage()">
                        {{ options().deleteLabel ?? intl.imageUploadDelete }}
                    </button>
                </div>

                @if (errorMessage()) {
                    <p class="kles-image-upload__error" role="alert">{{ errorMessage() }}</p>
                }
            </div>
        </div>
    `,
    styles: `
        :host {
            display: block;
        }

        .kles-image-upload {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .kles-image-upload__preview {
            display: grid;
            width: 120px;
            height: 120px;
            flex: 0 0 120px;
            place-items: center;
            overflow: hidden;
            border: 1px solid var(--mat-sys-outline-variant);
            border-radius: 22px;
            color: var(--mat-sys-outline);
            background: var(--mat-sys-surface-container-low);
        }

        .kles-image-upload__preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .kles-image-upload__preview mat-icon {
            width: 42px;
            height: 42px;
            font-size: 42px;
        }

        .kles-image-upload__content {
            min-width: 0;
        }

        .kles-image-upload__title {
            display: flex;
            align-items: center;
            gap: 10px;
            font: var(--mat-sys-title-large);
        }

        .kles-image-upload__title mat-icon {
            color: var(--mat-sys-primary);
        }

        .kles-image-upload__hint {
            margin: 8px 0 14px;
            color: var(--mat-sys-on-surface-variant);
        }

        .kles-image-upload__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .kles-image-upload__actions button {
            min-height: 44px;
        }

        .kles-image-upload__error {
            margin: 8px 0 0;
            color: var(--mat-sys-error);
            font: var(--mat-sys-body-small);
        }

        @media (max-width: 600px) {
            .kles-image-upload {
                align-items: flex-start;
            }

            .kles-image-upload__preview {
                width: 96px;
                height: 96px;
                flex-basis: 96px;
                border-radius: 16px;
            }
        }
    `,
})
export class KlesFormImageUploadComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    readonly intl = inject(KlesDynamicFormIntl);

    private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
    private readonly control: AbstractControl = this.group.controls[this.field.name];
    private readonly localPreviewUrl = signal<string | null>(null);
    private readonly imageRemoved = signal(false);
    private readonly controlValue = signal<unknown>(this.control.value);
    private controlSubscription?: Subscription;

    readonly options = computed(() => this.field.imageUploadOptions ?? {});
    readonly accept = computed(() => this.field.accept || DEFAULT_ACCEPT);
    readonly disabled = computed(() => this.control.disabled || !!this.field.disabled);
    readonly errorMessage = signal<string | null>(null);
    readonly previewUrl = computed(() => {
        if (this.imageRemoved()) {
            return null;
        }

        return this.localPreviewUrl() || this.previewFromValue(this.controlValue()) || this.imageUrl() || null;
    });
    readonly hasImage = computed(() => !!this.previewUrl());

    override ngOnInit(): void {
        super.ngOnInit();
        this.controlSubscription = this.control.valueChanges.subscribe((value) => {
            this.controlValue.set(value);
            if (!value) {
                this.clearLocalPreview();
            }
        });
    }

    override ngOnDestroy(): void {
        this.controlSubscription?.unsubscribe();
        this.clearLocalPreview();
        super.ngOnDestroy();
    }

    openFilePicker(): void {
        this.fileInput()?.nativeElement.click();
    }

    async selectFile(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.item(0);

        if (!file) {
            return;
        }

        if (!this.isAccepted(file)) {
            this.rejectFile('imageFileType', this.options().invalidTypeMessage ?? this.intl.imageUploadInvalidType);
            return;
        }

        if (file.size > (this.options().maxFileSize ?? DEFAULT_MAX_FILE_SIZE)) {
            this.rejectFile('imageFileSize', this.options().maxFileSizeMessage ?? this.intl.imageUploadMaxSize);
            return;
        }

        this.clearImageErrors();
        this.errorMessage.set(null);
        this.clearLocalPreview();
        this.localPreviewUrl.set(URL.createObjectURL(file));
        this.imageRemoved.set(false);

        const value: KlesFileValue = {
            name: file.name,
            content: await file.arrayBuffer(),
            type: file.type,
            size: file.size,
        };
        this.control.setValue([value] satisfies KlesFileControlValue);
        this.control.markAsDirty();
        this.control.markAsTouched();
    }

    deleteImage(): void {
        this.clearImageErrors();
        this.errorMessage.set(null);
        this.clearLocalPreview();
        this.imageRemoved.set(true);
        this.control.setValue(null);
        this.control.markAsDirty();
        this.control.markAsTouched();

        const input = this.fileInput()?.nativeElement;
        if (input) {
            input.value = '';
        }
    }

    private previewFromValue(value: unknown): string | null {
        return typeof value === 'string' ? value : null;
    }

    private isAccepted(file: File): boolean {
        const acceptedTypes = this.accept()
            .split(',')
            .map((type) => type.trim().toLowerCase())
            .filter(Boolean);

        return acceptedTypes.some((accepted) => {
            if (accepted === '*' || accepted === '*/*' || accepted === '*.*') {
                return true;
            }
            if (accepted.startsWith('.')) {
                return file.name.toLowerCase().endsWith(accepted);
            }
            if (accepted.endsWith('/*')) {
                return file.type.toLowerCase().startsWith(accepted.slice(0, -1));
            }
            return file.type.toLowerCase() === accepted;
        });
    }

    private rejectFile(errorKey: string, message: string): void {
        const input = this.fileInput()?.nativeElement;
        if (input) {
            input.value = '';
        }

        this.clearImageErrors();
        this.errorMessage.set(message);
        this.control.setErrors({ ...(this.control.errors ?? {}), [errorKey]: true });
        this.control.markAsTouched();
    }

    private clearImageErrors(): void {
        const errors = { ...(this.control.errors ?? {}) };
        delete errors['imageFileType'];
        delete errors['imageFileSize'];
        this.control.setErrors(Object.keys(errors).length ? errors : null);
    }

    private clearLocalPreview(): void {
        const preview = this.localPreviewUrl();
        if (preview) {
            URL.revokeObjectURL(preview);
            this.localPreviewUrl.set(null);
        }
    }
}
