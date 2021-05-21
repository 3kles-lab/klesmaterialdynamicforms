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
        if (changes.field) {
            if (changes.component.previousValue && changes.component.currentValue !== changes.component.previousValue) {
                this.component = changes.component.currentValue;
                this.buildComponent();
            } else {
                this.value = changes.value.currentValue;
            }
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
