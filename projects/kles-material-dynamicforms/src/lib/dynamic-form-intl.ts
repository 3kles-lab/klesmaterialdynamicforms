import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class KlesDynamicFormIntl {
    loading = 'Loading';
    selectAll = 'Select all';
    clearSearch = 'Clear';
    search = 'Search';
    add = 'Add';
    delete = 'Delete';
    copy = 'Copied value';
    empty = 'No items';
    imageUploadChange = 'Change image';
    imageUploadDelete = 'Delete';
    imageUploadInvalidType = 'Unsupported image format.';
    imageUploadMaxSize = 'The image exceeds the maximum allowed size.';
}
