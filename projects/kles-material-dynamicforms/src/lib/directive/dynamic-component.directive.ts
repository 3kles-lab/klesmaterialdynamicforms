import { Directive, Input, OnInit, ComponentFactoryResolver, ViewContainerRef, ComponentRef, Type, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[klesComponent]'
})
export class KlesComponentDirective implements OnInit, OnChanges {
    @Input() component: Type<any>;
    @Input() value: any;

    componentRef: ComponentRef<any>;

    constructor(private resolver: ComponentFactoryResolver,
        private container: ViewContainerRef) { }

    ngOnInit() {
        this.buildComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.component && !changes.component.isFirstChange()) {
            this.component = changes.component.currentValue;
            this.buildComponent();
        }
        if (changes.value && !changes.value.isFirstChange()) {
            this.value = changes.value.currentValue;
            this.componentRef.instance.value = this.value;
        }
    }

    buildComponent() {
        const factory = this.resolver.resolveComponentFactory(
            this.component
        );
        if (this.componentRef) this.componentRef.destroy();
        this.componentRef = this.container.createComponent(factory);
        this.componentRef.instance.component = this.component;
        this.componentRef.instance.value = this.value;
    }
}
