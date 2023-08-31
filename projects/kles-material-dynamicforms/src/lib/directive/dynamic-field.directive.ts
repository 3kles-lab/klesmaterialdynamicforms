import {
    Directive, Input, OnInit, ViewContainerRef, ComponentRef, OnChanges, SimpleChanges, OnDestroy, Type, Injector, StaticProvider
} from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { componentMapper } from '../decorators/component.decorator';
import { KlesFormClearComponent } from '../fields/clear.component';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

@Directive({
    selector: '[klesDynamicField]'
})
export class KlesDynamicFieldDirective implements OnInit, OnChanges, OnDestroy {
    @Input() field: IKlesFieldConfig;
    @Input() group: UntypedFormGroup;
    @Input() siblingFields: IKlesFieldConfig[];

    componentRef: ComponentRef<any>;
    subComponents: (ComponentRef<any>)[] = [];

    constructor(protected container: ViewContainerRef, private injector: Injector) { }

    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    ngOnInit() {
        this.buildComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.group) {
            this.group = changes.group.currentValue;
        }
        if (changes.field) {
            this.field = changes.field.currentValue;
            this.buildComponent();
        }
    }

    buildComponent() {
        if (this.componentRef) {
            this.subComponents.forEach(c => c.destroy());
            this.subComponents = [];
            this.componentRef.destroy();
        }

        const options: {
            providers: StaticProvider[];
            parent?: Injector;
            name?: string;
        } = {
            providers: this.field.dateOptions ? [
                ...(this.field.dateOptions.adapter ? [{
                    provide: DateAdapter,
                    useClass: this.field.dateOptions.adapter.class,
                    deps: this.field.dateOptions.adapter.deps || [],
                }] : []),
                { provide: MAT_DATE_LOCALE, useValue: this.field.dateOptions.language },
                { provide: MAT_DATE_FORMATS, useValue: this.field.dateOptions.dateFormat },
            ] : [],
            parent: this.injector
        };

        const injector: Injector = Injector.create(options);

        if (this.field.clearable) {
            const composant = this.createSubComponent(this.field.clearableComponent || KlesFormClearComponent);
            this.subComponents.push(composant);
        }
        if (this.field.subComponents) {
            this.subComponents.push(...this.field.subComponents.map((subComponent) => this.createSubComponent(subComponent)));
        }

        this.componentRef = this.container.createComponent(this.field.component
            || componentMapper.find(element => element.type === this.field.type)?.component,
            { injector, projectableNodes: [this.subComponents.map(sub => sub.location.nativeElement)] });

        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
        this.componentRef.instance.siblingFields = this.siblingFields;
    }

    private createSubComponent(componentType: Type<any>): ComponentRef<any> {
        const component = this.container.createComponent(componentType);
        component.instance.field = this.field;
        component.instance.group = this.group;
        component.instance.siblingFields = this.siblingFields;
        return component;
    }
}
