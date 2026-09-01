import { Component, computed, ElementRef, forwardRef, input, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IButton, KlesButtonBase } from './button-control-base';
import { KlesButtonComponent } from './button-control.component';


export interface IButtonFile extends IButton {
    fileContent?: string | ArrayBuffer | (string | ArrayBuffer)[] | null;
}

@Component({
    selector: 'kles-button-file',
    template: `
        <input type="file" #file style="display: none" [accept]="effectiveAccept()" (change)="onFileSelect($event.target)" multiple />
        <kles-button
            [classButton]="effectiveClassButton()"
            [name]="name()" [label]="effectiveLabel()" [color]="effectiveColor()"
            [icon]="effectiveIcon()" [iconSvg]="effectiveIconSvg()"
            [disabled]="effectiveDisabled()"
            [value]="effectiveValue()" (click)="click($event)">
        </kles-button>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KlesButtonFileComponent),
            multi: true
        }
    ],
    standalone: true,
    imports: [KlesButtonComponent],
})
export class KlesButtonFileComponent extends KlesButtonBase<IButtonFile> {
    private readonly file = viewChild<ElementRef<HTMLInputElement>>('file');
    readonly accept = input('*.*');
    readonly effectiveAccept = computed(() => this.uiButtonState()?.accept ?? this.accept());

    click(_event: MouseEvent): void {
        if (!this.effectiveDisabled()) {
            this.file()?.nativeElement.click();
        }
    }

    override writeValue(value: IButtonFile | null | undefined): void {
        super.writeValue(value);

        if (!value?.fileContent) {
            this.resetNativeFileInput();
        }
    }

    async onFileSelect(input: HTMLInputElement): Promise<void> {
        const files = input.files;

        try {
            if (files && files.length > 0) {
                const fileContents: (string | ArrayBuffer)[] = [];
                for (let i = 0; i < files.length; i++) {
                    try {
                        const content = await this.readUploadedFile(files[i]);
                        if (content !== null) {
                            fileContents.push(content);
                        }
                    } catch {
                    }
                }

                const value = this.effectiveValue();
                value.event = this.name();
                value.fileContent = fileContents.length === 1 ? fileContents[0] : fileContents;
                this.onChange(value);
                input.value = '';
            }
        } finally {
            this.markAsTouched();
        }
    }

    readUploadedFile(inputFile: File): Promise<string | ArrayBuffer | null> {
        const temporaryFileReader = new FileReader();
        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                const error: DOMException = new DOMException('Problem parsing input file.');
                reject(error);
            };
            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsArrayBuffer(inputFile);
        });
    }

    private resetNativeFileInput(): void {
        const input = this.file()?.nativeElement;
        if (input) {
            input.value = '';
        }
    }
}
