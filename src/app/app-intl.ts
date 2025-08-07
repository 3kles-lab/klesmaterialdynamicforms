import { Injectable } from '@angular/core';
import { KlesDynamicFormIntl } from 'kles-material-dynamicforms';

@Injectable({providedIn: 'root'})
export class TranslatedKlesLabelIntl extends KlesDynamicFormIntl {
    override loading = 'Chargement';
    override selectAll = 'Tout sélectionner';
    
}
