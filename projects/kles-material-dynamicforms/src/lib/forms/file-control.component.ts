
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'kles-file-control',
    template: ` <input [accept]="accept" [multiple]="multiple" (change)="onFileSelected($event.target)" type="file" /> `,
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
    @Input() disabled = false;
    @Input() accept = '*.*';
    @Input() multiple = false;

    value: { name: string; content: ArrayBuffer }[];

    onChange: any = () => {};
    onTouched: any = () => {};

    writeValue(obj: any): void {}

    async onFileSelected(input: HTMLInputElement): Promise<void> {
        if (input.files.length > 0) {
            const file: FileList = input.files;
            let files = [];

            for (let i = 0; i < file.length; i++) {
                const currentFile: File = file.item(i);

                files[i] = { name: currentFile.name, content: await currentFile.arrayBuffer() };
            }

            this.value = files;
            this.onChange(this.value);
        } else {
            this.value = null;
            this.onChange(this.value);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
