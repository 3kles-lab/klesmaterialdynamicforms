import { Directive, Input, OnInit, ComponentFactoryResolver, ViewContainerRef, ComponentRef, Type, OnChanges, SimpleChanges } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { IFieldConfig } from '../interfaces';
import {
    InputComponent, ButtonComponent, SelectComponent,
    DateComponent, RadioComponent, CheckboxComponent, ListFieldComponent,
    ColorComponent
} from '../fields';

const componentMapper = {
    input: InputComponent,
    button: ButtonComponent,
    select: SelectComponent,
    date: DateComponent,
    radio: RadioComponent,
    checkbox: CheckboxComponent,
    listField: ListFieldComponent,
    color: ColorComponent
};

@Directive({
    selector: '[dynamicField]'
})
export class DynamicFieldDirective implements OnInit, OnChanges {
    @Input() field: IFieldConfig;
    @Input() group: FormGroup;

    componentRef: ComponentRef<any>;

    constructor(private resolver: ComponentFactoryResolver,
        private container: ViewContainerRef) { }

    ngOnInit() {
        this.buildComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.group) {
            this.group = changes.group.currentValue;
        }
        if (changes.field) {
            if (changes.field.previousValue && changes.field.currentValue.component !== changes.field.previousValue.component) {
                console.log('####Component Change!!!');
                this.field = changes.field.currentValue;
                this.buildComponent();
            } else {
                this.field = changes.field.currentValue;
            }
        }
    }

    buildComponent() {
        const factory = this.resolver.resolveComponentFactory(
            this.field.component || componentMapper[this.field.type]
        );
        if (this.componentRef) this.componentRef.destroy();
        this.componentRef = this.container.createComponent(factory);
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
    }
}
