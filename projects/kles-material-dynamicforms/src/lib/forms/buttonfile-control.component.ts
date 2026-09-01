import { Input, ChangeDetectionStrategy, ElementRef } from '@angular/core';
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
        <input type="file" #file style="display: none" [accept]="accept" (change)="onFileSelect($event.target)" multiple />
        <kles-button
            [classButton]="classButton"
            [name]="name" [label]="label" [color]="color"
            [icon]="icon" [iconSvg]="iconSvg"
            [disabled]="disabled"
            [value]="value" (click)="click($event)">
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [KlesButtonComponent],
})
export class KlesButtonFileComponent extends KlesButtonBase {
    @ViewChild('file') file!: ElementRef<HTMLInputElement>;
    @Input() accept = '*.*';
    fileReader = new FileReader();
    fileContent: string | ArrayBuffer | null = null;
    value: IButtonFile = {};


    click(_event: MouseEvent): void {
        if (!this.disabled) {
            this.file.nativeElement.click();
        }
    }

    writeValue(value: IButton): void {
        if (!value) {
            value = { event: this.name };
        }
        if (!value.event) {
            value.event = this.name;
        }
        if (value.uiButton) {
            const uiButton = value.uiButton;
            this.label = (uiButton.label) ? uiButton.label : this.label;
            this.color = (uiButton.color) ? uiButton.color : this.color;
            this.icon = (uiButton.icon) ? uiButton.icon : this.icon;
            this.iconSvg = (uiButton.iconSvg) ? uiButton.iconSvg : this.iconSvg;
            this.disabled = (uiButton.disabled) ? uiButton.disabled : this.disabled;
            this.classButton = (uiButton.class) ? uiButton.class : this.classButton;
            this.accept = (uiButton.accept) ? uiButton.accept : this.accept;
        }
        this.value = value;
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

            this.value.event = this.name;
            this.value.fileContent = fileContents.length === 1 ? fileContents[0] : fileContents;
            this.onChange(this.value);
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
