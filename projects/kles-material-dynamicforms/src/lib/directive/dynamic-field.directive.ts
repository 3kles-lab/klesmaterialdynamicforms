import {
    Directive, Input, OnInit, ViewContainerRef, ComponentRef, OnChanges, SimpleChanges, OnDestroy, Type, Injector, StaticProvider
} from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { componentMapper } from '../decorators/component.decorator';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';

@Directive({
    selector: '[klesDynamicField]'
})
export class KlesDynamicFieldDirective implements OnInit, OnChanges, OnDestroy {
    @Input() field: IKlesFieldConfig;
    @Input() group: UntypedFormGroup;
    @Input() siblingFields: IKlesFieldConfig[];

    componentRef: ComponentRef<any>;

    constructor(protected container: ViewContainerRef) { }

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
            this.componentRef.destroy();
        }

        const options: {
            providers: StaticProvider[];
            parent?: Injector;
            name?: string;
        } = {
            providers: this.field.dateOptions ? [
                { provide: MAT_DATE_LOCALE, useValue: this.field.dateOptions.language },
                { provide: MAT_DATE_FORMATS, useValue: this.field.dateOptions.dateFormat },
            ] : []
        };

        const injector: Injector = Injector.create(options);

        this.componentRef = this.container.createComponent(this.field.component
            || componentMapper.find(element => element.type === this.field.type)?.component, { injector });


        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
        this.componentRef.instance.siblingFields = this.siblingFields;
    }
}
