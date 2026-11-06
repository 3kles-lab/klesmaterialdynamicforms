import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class KlesDynamicFormIntl {
    loading = 'Loading';
    phoneInvalid = 'Invalid international phone number.';
    selectAll = 'Select all';
    clearSearch = 'Clear';
    search = 'Search';
    add = 'Add';
    delete = 'Delete';
    copy = 'Copied value';
    empty = 'No items';
    listFieldItem = (index: number, title = 'Item'): string => `${title} ${index + 1}`;
    listFieldInvalid = 'This item contains invalid fields.';
    listFieldDelete = (title: string): string => `${this.delete} ${title}`;
    listFieldMoveUp = (title: string): string => `Move ${title} up`;
    listFieldMoveDown = (title: string): string => `Move ${title} down`;
    listFieldDrag = (title: string): string => `Reorder ${title}. Use the up and down arrow keys or the move buttons.`;
    listFieldAdded = (title: string): string => `${title} added`;
    listFieldRemoved = (title: string): string => `${title} deleted`;
    listFieldMoved = (title: string, position: number, total: number): string => `${title} moved to position ${position} of ${total}`;
    listFieldMinItems = (count: number): string => `At least ${count} items are required.`;
    listFieldMaxItems = (count: number): string => `At most ${count} items are allowed.`;
    imageUploadChange = 'Change image';
    imageUploadDelete = 'Delete';
    imageUploadInvalidType = 'Unsupported image format.';
    imageUploadMaxSize = 'The image exceeds the maximum allowed size.';
}
