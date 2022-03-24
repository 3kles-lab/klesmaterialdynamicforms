import { Component, OnInit, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IButton, KlesButtonComponent } from './button-control.component';

export interface IButtonFile extends IButton {
    fileContent?: string | string[];
}

@Component({
    selector: 'kles-button-file',
    template: `
        <input type="file" #file style="display: none" accept="{{accept}}" (change)="onFileSelect($event.target)" multiple />
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
    ]
})
export class KlesButtonFileComponent extends KlesButtonComponent implements ControlValueAccessor {
    @ViewChild('file') file;
    accept = '*.*';
    fileReader = new FileReader();
    fileContent: string | string[];
    value: IButtonFile = {};

    click(event) {
        this.file.nativeElement.click();
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
        }
        this.value = value;
    }


    onFileLoad(fileLoadedEvent) {
        const textFromFileLoaded = fileLoadedEvent.target.result;
        this.fileContent = textFromFileLoaded;
    }

    async onFileSelect(input: HTMLInputElement) {
        if (input.files.length > 0) {
            const files = input.files;
            let fileContent = [];
            if (files && files.length) {
                for (let i = 0; i < files.length; i++) {
                    try {
                        fileContent[i] = await this.readUploadedFile(files[i]);
                    } catch (e) {
                    }
                }
                if (fileContent.length === 1) {
                    fileContent = fileContent[0];
                }
            }
            this.value.event = this.name;
            this.value.fileContent = fileContent;
            this.onChange(this.value);
            input.value = '';
        }
    }

    readUploadedFile(inputFile): Promise<any> {
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
