import { Directive, Input, OnInit, ComponentFactoryResolver, ViewContainerRef, ComponentRef, Type, OnChanges, SimpleChanges, OnDestroy, Injector } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { IKlesFieldConfig } from '../interfaces/field.config.interface';
import { KlesFormLabelComponent } from '../fields/label.component';
import { KlesFormInputComponent } from '../fields/input.component';
import { KlesFormSubmitButtonComponent } from '../fields/button-submit.component';
import { KlesFormSelectComponent } from '../fields/select.component';
import { KlesFormDateComponent } from '../fields/date.component';
import { KlesFormRadioComponent } from '../fields/radio.component';
import { KlesFormCheckboxComponent } from '../fields/checkbox.component';
import { KlesFormListFieldComponent } from '../fields/list-field.component';
import { KlesFormColorComponent } from '../fields/color.component';
import { KlesFormChipComponent } from '../fields/chip.component';
import { KlesFormGroupComponent } from '../fields/group.component';
import { KlesFormIconComponent } from '../fields/icon.component';
import { KlesFormSelectSearchComponent } from '../fields/select.search.component';
import { KlesFormLineBreakComponent } from '../fields/line-break.component';
import { KlesFormLinkComponent } from '../fields/link.component';
import { KlesFormSelectionListComponent } from '../fields/selection-list.component';
import { KlesFormButtonToogleGroupComponent } from '../fields/button-toogle-group.component';
import { KlesFormArrayComponent } from '../fields/array.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

const componentMapper = {
    label: KlesFormLabelComponent,
    input: KlesFormInputComponent,
    button: KlesFormSubmitButtonComponent,
    select: KlesFormSelectComponent,
    date: KlesFormDateComponent,
    radio: KlesFormRadioComponent,
    checkbox: KlesFormCheckboxComponent,
    listField: KlesFormListFieldComponent,
    array: KlesFormArrayComponent,
    color: KlesFormColorComponent,
    chip: KlesFormChipComponent,
    group: KlesFormGroupComponent,
    icon: KlesFormIconComponent,
    selectSearch: KlesFormSelectSearchComponent,
    lineBreak: KlesFormLineBreakComponent,
    link: KlesFormLinkComponent,
    selectionList: KlesFormSelectionListComponent,
    buttonToogleGroup: KlesFormButtonToogleGroupComponent
};

@Directive({
    selector: '[klesDynamicField]'
})
export class KlesDynamicFieldDirective implements OnInit, OnChanges, OnDestroy {
    @Input() field: IKlesFieldConfig;
    @Input() group: FormGroup;
    @Input() siblingFields: IKlesFieldConfig[];

    componentRef: ComponentRef<any>;

    constructor(protected resolver: ComponentFactoryResolver,
        protected container: ViewContainerRef) { }

    ngOnDestroy(): void {
        if (this.componentRef) this.componentRef.destroy();
    }

    ngOnInit() {
        this.buildComponent();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.group) {
            this.group = changes.group.currentValue;
        }
        if (changes.field) {
            // if (changes.field.previousValue && changes.field.currentValue.component !== changes.field.previousValue.component) {
            this.field = changes.field.currentValue;
            this.buildComponent();
            // } else {
            //     this.field = changes.field.currentValue;
            // }
        }
    }

    buildComponent() {
        const factory = this.resolver.resolveComponentFactory(
            this.field.component || componentMapper[this.field.type]
        );
        if (this.componentRef) this.componentRef.destroy();
        if (this.field.dateOptions) {
            const options: any = {
                providers: [
                    { provide: MAT_DATE_LOCALE, useValue: this.field.dateOptions.language },
                    // {
                    //     provide: DateAdapter,
                    //     useClass: this.field.dateOptions.dateAdapter,
                    //     // deps: [MAT_DATE_LOCALE, this.field.dateOptions.dateAdapterOptions]
                    //     deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
                    // },
                    { provide: MAT_DATE_FORMATS, useValue: this.field.dateOptions.dateFormat },
                ]
            };
            const injector: Injector = Injector.create(options);
            this.componentRef = this.container.createComponent(factory, 0, injector);
        } else {
            this.componentRef = this.container.createComponent(factory);
        }
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
        this.componentRef.instance.siblingFields = this.siblingFields;
    }
}
