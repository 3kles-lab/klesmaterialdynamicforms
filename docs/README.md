# Documentation

- [`KlesDynamicFormComponent`](#klesdynamicformcomponent): Component to create form with list of IFieldConfig
- [`Directives`](./directives.md): List of directives
- [`Interfaces`](./interfaces.md): List of interfaces
- [`Fields`](./fields.md): List of fields to build Form
- [`Matchers`](./matchers.md): List of matcher for Form
- [`Validators`](./validators.md): List of validators to check Form


### KlesDynamicFormComponent

Component to create form with list of IFieldConfig

##### File

```typescript
import { KlesDynamicFormComponent } from 'kles-material-dynamicforms';
```

##### Usage

```javascript
@ViewChild(KlesDynamicFormComponent, { static: false }) form: KlesDynamicFormComponent;
fields: IKlesFieldConfig[] = [];
formValidators: IKlesValidator<ValidatorFn>[] = [];

this.fields.push(
    {
      name: 'inputtext',
      placeholder: 'Input Text',
      inputType: 'text',
      tooltip: 'tooltip text',
      value: 'input text value',
      component: KlesFormInputComponent,
    }
);
this.fields.push(
    {
      name: 'inputtext2',
      placeholder: 'Input Text2',
      inputType: 'text',
      tooltip: 'tooltip text2',
      value: 'input text value 2',
      component: KlesFormInputComponent,
    }
);
this.formValidators = [];
```

```html
<app-kles-dynamic-form #form direction="row" [wrap]="false" [fields]="fields" [validators]="formValidators"></app-kles-dynamic-form>
```

`wrap` vaut `true` par défaut. En direction `row`, utilisez `[wrap]="false"` pour empêcher le retour à la ligne des champs.

L'entrée `[submitting]` (booléen, `false` par défaut) représente une soumission
en cours. Le parent la passe à `true` avant l'enregistrement et la réinitialise
dans `finally` ou `finalize`, y compris en cas d'erreur. Pendant ce temps, les
boutons standard, icône, FAB et mini-FAB de type `submit` sont désactivés et
affichent un spinner, même dans les groupes et les sections. Les autres boutons
restent disponibles et les nouvelles soumissions sont ignorées. Les valeurs et
les états des contrôles Angular sont conservés.

```html
<app-kles-dynamic-form [fields]="fields" [submitting]="saving()" (submit)="save($event)"></app-kles-dynamic-form>
```

Consultez l'[exemple complet de gestion de la soumission](../projects/kles-material-dynamicforms/README.md#submission-state).
