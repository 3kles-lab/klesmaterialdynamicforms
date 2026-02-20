import { Directive, Input, OnInit, ViewContainerRef, ComponentRef, OnChanges, SimpleChanges, OnDestroy, Type, Injector, StaticProvider, Provider } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { componentMapper } from '../decorators/component.decorator';
import { KlesFormClearComponent } from '../fields/subfields/clear.component';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { isDestroyable } from '../utils/destroyable.guard';
import { FIELD, FIELD_NAME, GROUP, SIBLING_FIELDS, GROUP_UI } from '../token';
import { GroupUiState } from '../ui/ui-state/group-ui-state';

@Directive({
    selector: '[klesDynamicField]',
    standalone: true,
})
export class KlesDynamicFieldDirective<T extends IKlesFieldConfig = IKlesFieldConfig> implements OnInit, OnChanges, OnDestroy {
    @Input() field: T;
    @Input() group: UntypedFormGroup;
    @Input() ui: GroupUiState;
    @Input() siblingFields: T[];

    componentRef: ComponentRef<any>;
    subComponents: ComponentRef<any>[] = [];

    constructor(
        protected container: ViewContainerRef,
        protected injector: Injector,
    ) {}

    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    ngOnInit() {
        this.buildComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.group && !changes.group.isFirstChange()) {
            this.group = changes.group.currentValue;
        }
        if (changes.field && !changes.field?.isFirstChange()) {
            this.field = changes.field.currentValue;
            this.buildComponent();
        }
    }

    buildComponent() {
        if (this.componentRef) {
            this.subComponents.forEach((c) => c.destroy());
            this.subComponents = [];
            this.componentRef.destroy();
        }

        const options: {
            providers: Array<Provider | StaticProvider>;
            parent?: Injector;
            name?: string;
        } = {
            providers: [
                ...(this.field.providers || []),
                ...(this.field.dateOptions
                    ? [
                          ...(this.field.dateOptions.adapter
                              ? [
                                    {
                                        provide: DateAdapter,
                                        useClass: this.field.dateOptions.adapter.class,
                                        deps: this.field.dateOptions.adapter.deps || [],
                                    },
                                ]
                              : []),
                          { provide: MAT_DATE_LOCALE, useValue: this.field.dateOptions.language },
                          { provide: MAT_DATE_FORMATS, useValue: this.field.dateOptions.dateFormat },
                      ]
                    : []),
                {
                    provide: FIELD_NAME,
                    useValue: this.field.name,
                },
                {
                    provide: FIELD,
                    useValue: this.field,
                },
                {
                    provide: GROUP,
                    useValue: this.group,
                },
                {
                    provide: SIBLING_FIELDS,
                    useValue: this.siblingFields,
                },
                {
                    provide: GROUP_UI,
                    useValue: this.ui,
                },
            ],
            parent: this.injector,
        };

        const injector: Injector = Injector.create(options);

        if (this.field.clearable) {
            const composant = this.createSubComponent(this.field.clearableComponent || KlesFormClearComponent, options);
            this.subComponents.push(composant);
        }
        if (this.field.subComponents) {
            this.subComponents.push(...this.field.subComponents.map((subComponent) => this.createSubComponent(subComponent, options)));
        }

        this.componentRef = this.createComponentRef(injector);

        this.componentRef.onDestroy(() => {
            if (isDestroyable(injector)) {
                injector.destroy();
            }
        });
    }

    protected createComponentRef(injector: Injector) {
        const componentRef = this.container.createComponent(this.findComponent(), {
            injector,
            projectableNodes: [this.subComponents.map((sub) => sub.location.nativeElement)],
        });

        if (this.field.hostClass) {
            if (Array.isArray(this.field.hostClass)) {
                componentRef.location.nativeElement.classList.add(...this.field.hostClass);
            } else {
                componentRef.location.nativeElement.classList.add(this.field.hostClass);
            }
        }

        return componentRef;
    }

    protected findComponent(): Type<any> {
        return componentMapper.find((element) => element.type === this.field.type)?.component || this.field.component;
    }

    private createSubComponent(
        componentType: Type<any>,
        options: {
            providers: Array<Provider | StaticProvider>;
            parent?: Injector;
            name?: string;
        },
    ): ComponentRef<any> {
        const injector: Injector = Injector.create(options);
        const component = this.container.createComponent(componentType, { injector });

        component.onDestroy(() => {
            if (isDestroyable(injector)) {
                injector.destroy();
            }
        });

        return component;
    }
}
