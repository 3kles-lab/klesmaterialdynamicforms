import {
    Directive, Input, OnInit, ViewContainerRef, ComponentRef, OnChanges, SimpleChanges, OnDestroy, Type
} from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';
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
        this.componentRef = this.container.createComponent(this.field.component
            || componentMapper.find(element => element.type === this.field.type)?.component);

        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
        this.componentRef.instance.siblingFields = this.siblingFields;
    }
}
