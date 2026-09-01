import { computed, ElementRef, input } from '@angular/core';
import { Component, forwardRef, ViewChild } from '@angular/core';
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
    @ViewChild('file') file!: ElementRef<HTMLInputElement>;
    readonly accept = input('*.*');
    readonly effectiveAccept = computed(() => this.uiButtonState()?.accept ?? this.accept());
    fileReader = new FileReader();
    fileContent: string | ArrayBuffer | null = null;
    click(_event: MouseEvent): void {
        if (!this.effectiveDisabled()) {
            this.file.nativeElement.click();
        }
    }

    onFileLoad(fileLoadedEvent: ProgressEvent<FileReader>): void {
        const textFromFileLoaded = fileLoadedEvent.target?.result ?? null;
        this.fileContent = textFromFileLoaded;
    }

    async onFileSelect(input: HTMLInputElement): Promise<void> {
        const files = input.files;

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
}
