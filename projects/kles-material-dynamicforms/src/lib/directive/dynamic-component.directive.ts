import { Directive, Input, OnInit, ViewContainerRef, ComponentRef, OnChanges, SimpleChanges, Injector, OnDestroy } from '@angular/core';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { FIELD } from '../token';
import { IKlesComponent, KlesComponentType } from '../interfaces/component.interface';

@Directive({
    selector: '[klesComponent]',
    standalone: true,
})
export class KlesComponentDirective<TValue = unknown> implements OnInit, OnChanges, OnDestroy {
    @Input({ required: true }) component!: KlesComponentType<TValue>;
    @Input({ required: true }) value!: TValue;
    @Input({ required: true }) field!: IKlesFieldConfig;

    componentRef?: ComponentRef<IKlesComponent<TValue>>;

    constructor(private container: ViewContainerRef) {}

    ngOnInit() {
        this.buildComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const componentChanged = changes['component'] && !changes['component'].isFirstChange();
        const fieldChanged = changes['field'] && !changes['field'].isFirstChange();

        if (componentChanged || fieldChanged) {
            this.buildComponent();
            return;
        }

        if (changes['value'] && !changes['value'].isFirstChange()) {
            this.componentRef?.setInput('value', this.value);
        }
    }

    ngOnDestroy(): void {
        this.componentRef?.destroy();
    }

    private buildComponent(): void {
        this.componentRef?.destroy();

        const injector = Injector.create({
            providers: [
                ...(this.field.providers ?? []),
                {
                    provide: FIELD,
                    useValue: this.field,
                },
            ],
            parent: this.container.injector,
        });

        this.componentRef = this.container.createComponent(this.component, { injector });
        this.componentRef.setInput('value', this.value);
    }
}
