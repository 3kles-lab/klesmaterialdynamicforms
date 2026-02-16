import { Directive, Input, OnInit, ViewContainerRef, ComponentRef, Type, OnChanges, SimpleChanges, Injector } from '@angular/core';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FIELD } from '../token';

@Directive({
    selector: '[klesComponent]',
    standalone: true,
})
export class KlesComponentDirective implements OnInit, OnChanges {
    @Input() component: Type<any>;
    @Input() value: any;
    @Input() field?: IKlesFieldConfig;

    componentRef: ComponentRef<any>;

    constructor(private container: ViewContainerRef) {}

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
        if (this.componentRef) {
            this.componentRef.destroy();
        }
        const options = {
            providers: [
                {
                    provide: FIELD,
                    useValue: this.field,
                },
            ],
        };

        const injector: Injector = Injector.create(options);

        this.componentRef = this.container.createComponent(this.component, { injector });
        this.componentRef.instance.component = this.component;
        this.componentRef.instance.value = this.value;
    }
}
