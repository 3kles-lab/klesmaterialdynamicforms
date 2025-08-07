import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root', // ou dans un provider dédié si besoin
})
export class KlesDynamicFormIntl {
    loading = 'Loading';
    selectAll = 'Select all';
}
