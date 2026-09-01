import { Injectable } from '@angular/core';
import { KlesDynamicFormIntl } from 'kles-material-dynamicforms';

@Injectable({providedIn: 'root'})
export class TranslatedKlesLabelIntl extends KlesDynamicFormIntl {
    override loading = 'Chargement';
    override selectAll = 'Tout sélectionner';
    override copy: string = 'Valeur copié !!';
    override imageUploadChange = 'Modifier l’image';
    override imageUploadDelete = 'Supprimer';
    override imageUploadInvalidType = 'Format d’image non pris en charge.';
    override imageUploadMaxSize = 'L’image dépasse la taille maximale autorisée.';
}
