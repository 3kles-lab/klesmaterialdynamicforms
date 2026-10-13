import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { defer, merge, of } from 'rxjs';
import { auditTime, delay, map, tap } from 'rxjs/operators';
import {
    IKlesFieldConfig,
    IKlesFormDynamicFields,
    KlesDynamicFormComponent,
    KlesFormCheckboxComponent,
    KlesFormElement,
    KlesFormInputComponent,
    KlesFormSelectComponent,
    flattenKlesFields,
} from 'kles-material-dynamicforms';

interface DemoFieldDefinition {
    name: string;
    label: string;
    inputType: 'text' | 'email';
    required?: boolean;
}

@Component({
    selector: 'app-dynamic-fields-demo',
    standalone: true,
    imports: [JsonPipe, MatButtonModule, KlesDynamicFormComponent],
    templateUrl: './dynamic-fields-demo.component.html',
    styleUrls: ['./dynamic-fields-demo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldsDemoComponent {
    private readonly formRef = viewChild<KlesDynamicFormComponent>('dynamicForm');
    get dynamicForm(): KlesDynamicFormComponent { return this.formRef()!; }
    private readonly destroyRef = inject(DestroyRef);
    private extraFieldIndex = 0;

    readonly optionLoads = signal(0);
    readonly definitionLoads = signal(0);
    readonly referenceRequired = signal(false);
    readonly referenceDisabled = signal(false);
    readonly checkboxAnswer = signal(false);
    readonly values = signal<Record<string, unknown>>({});
    readonly controlNames = signal<string[]>([]);
    readonly formStatus = signal('VALID');

    private readonly applicantField: IKlesFieldConfig = {
        name: 'demandeur', component: KlesFormInputComponent,
        label: 'Nom du demandeur', hint: 'Cette valeur reste présente lorsque les champs supplémentaires changent.',
    };
    private readonly selectField: IKlesFieldConfig = {
        name: 'typeDossier', component: KlesFormSelectComponent,
        label: 'Type de dossier', value: 'Aucun',
        options: defer(() => of(['Aucun', 'Particulier', 'Entreprise', 'Erreur simulée']).pipe(
            // delay(150),
            // tap(() => this.optionLoads.update((count) => count + 1)),
        )),
    };
    private readonly generatedFields: IKlesFormDynamicFields = {
        type: 'dynamicFields',
        fields: [],
        dependsOn: ['typeDossier'],
        resolveFields: ({ values }) => {
            const type = values['typeDossier'];
            if (typeof type !== 'string' || type === 'Aucun') return [];
            // The library observes the select, subscribes and discards stale results.
            // The application only supplies the service and converts its definitions.
           return this.loadDefinition(type).map((definition) => this.createField(definition));
        },
    };
    /** Independent manual additions still demonstrate the synchronization from stage 2. */
    private readonly manualFields: IKlesFormDynamicFields = { type: 'dynamicFields', fields: [] };
    private referenceField: IKlesFieldConfig = {
        name: 'reference', component: KlesFormInputComponent,
        label: 'Référence', hint: 'Testez ici la validation et la désactivation sans perdre votre saisie.',
    };
    private answerField: IKlesFieldConfig = {
        name: 'reponse', component: KlesFormInputComponent,
        label: 'Réponse', value: 'Réponse initiale',
    };

    readonly fields = signal<KlesFormElement[]>(this.buildFields());
    readonly resolution = computed(() => this.formRef()?.fieldResolutions().get(this.generatedFields));
    readonly loading = computed(() => this.resolution()?.status === 'loading');
    readonly resolvedFields = computed(() => flattenKlesFields(this.resolution()?.fields ?? []));

    constructor() {
        // Only the value/status preview needs a subscription in the application.
        // Dependency observation and resolution are entirely handled by the library.
        afterNextRender(() => {
            const form = this.dynamicForm.form;
            merge(form.valueChanges, form.statusChanges, form.events)
                .pipe(auditTime(0), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.refreshPreview());
            this.refreshPreview();
        });
    }

    toggleRequired(): void {
        this.referenceRequired.update((required) => !required);
        this.referenceField = {
            ...this.referenceField,
            validations: this.referenceRequired()
                ? [{ name: 'required', validator: Validators.required, message: 'La référence est obligatoire.' }]
                : [],
        };
        this.fields.set(this.buildFields());
    }

    toggleDisabled(): void {
        this.referenceDisabled.update((disabled) => !disabled);
        this.referenceField = { ...this.referenceField, disabled: this.referenceDisabled() };
        this.fields.set(this.buildFields());
    }

    toggleAnswerType(): void {
        this.checkboxAnswer.update((checkbox) => !checkbox);
        this.answerField = {
            name: 'reponse',
            component: this.checkboxAnswer() ? KlesFormCheckboxComponent : KlesFormInputComponent,
            label: 'Réponse', value: this.checkboxAnswer() ? true : 'Réponse initiale',
        };
        this.fields.set(this.buildFields());
    }

    addExtraField(): void {
        const index = ++this.extraFieldIndex;
        this.manualFields.fields = [...this.manualFields.fields, {
            name: `complement${index}`, component: KlesFormInputComponent,
            label: `Complément ${index}`,
        }];
        this.fields.set(this.buildFields());
    }

    removeExtraFields(): void {
        this.manualFields.fields = this.manualFields.fields.filter((field) =>
            !('name' in field) || !field.name.startsWith('complement'),
        );
        this.fields.set(this.buildFields());
    }

    refreshPreview(): void {
        this.values.set(this.dynamicForm.form.getRawValue());
        this.controlNames.set(Object.keys(this.dynamicForm.form.controls));
        this.formStatus.set(this.dynamicForm.form.status);
    }

    private buildFields(): KlesFormElement[] {
        // Preserve unchanged field and container objects. Only the outer array
        // and configurations intentionally edited above are replaced.
        return [this.applicantField, this.selectField, this.generatedFields, this.manualFields, this.referenceField, this.answerField];
    }

    private loadDefinition(type: string): DemoFieldDefinition[] {
        return type === 'Entreprise'
            ? [
                { name: 'raisonSociale', label: 'Raison sociale', inputType: 'text', required: true },
                { name: 'siret', label: 'SIRET', inputType: 'text' },
            ]
            : [
                { name: 'emailContact', label: 'Email de contact', inputType: 'email', required: true },
                { name: 'ville', label: 'Ville', inputType: 'text' },
            ];
    }

    private createField(definition: DemoFieldDefinition): IKlesFieldConfig {
        return {
            name: definition.name, component: KlesFormInputComponent,
            label: definition.label, inputType: definition.inputType,
            validations: [
                ...(definition.required ? [{ name: 'required', validator: Validators.required, message: 'Ce champ est obligatoire.' }] : []),
                ...(definition.inputType === 'email' ? [{ name: 'email', validator: Validators.email, message: 'Saisissez une adresse email valide.' }] : []),
            ],
        };
    }
}
