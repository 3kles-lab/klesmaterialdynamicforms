
import { Component, ElementRef, forwardRef, Input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'kles-file-control',
    template: ` <input #fileInput [accept]="accept" [multiple]="multiple" [disabled]="disabled" (change)="onFileSelected($event.target)" (blur)="markAsTouched()" type="file" /> `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesFileControlComponent),
            multi: true,
        },
    ],
    standalone: true,
    imports: [FormsModule],
})
export class KlesFileControlComponent implements ControlValueAccessor {
    private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
    private readonly disabledState = signal(false);

    @Input() get disabled(): boolean {
        return this.disabledState();
    }
    set disabled(value: boolean) {
        this.disabledState.set(value);
    }

    @Input() accept = '*.*';
    @Input() multiple = false;

    value: KlesFileControlValue = null;

    private onChange: (value: KlesFileControlValue) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: KlesFileControlValue | undefined): void {
        this.value = value ?? null;

        if (!value || value.length === 0) {
            const input = this.fileInput()?.nativeElement;
            if (input) {
                input.value = '';
            }
        }
    }

    async onFileSelected(input: HTMLInputElement): Promise<void> {
        const fileList = input.files;

        if (fileList && fileList.length > 0) {
            const files: { name: string; content: ArrayBuffer }[] = [];

            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList.item(i);

                if (!currentFile) {
                    continue;
                }

                files[i] = { name: currentFile.name, content: await currentFile.arrayBuffer() };
            }

            this.value = files;
            this.onChange(this.value);
        } else {
            this.value = null;
            this.onChange(this.value);
        }

        this.markAsTouched();
    }

    registerOnChange(fn: (value: KlesFileControlValue) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    markAsTouched(): void {
        this.onTouched();
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

export interface KlesFileValue {
    name: string;
    content: ArrayBuffer;
}

export type KlesFileControlValue = KlesFileValue[] | null;
