import { Component, OnInit, Type, ChangeDetectionStrategy } from "@angular/core";
import { IKlesComponent } from "projects/kles-material-dynamicforms/src/public-api";

@Component({
    selector: 'kles-auto',
    template: `
    <span>
        {{value.test}} - {{value.val}}
    </span> 
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class AutocompleteComponent implements IKlesComponent, OnInit {
    component: Type<any>;
    value: any;

    ngOnInit() {
        // console.log('Value=', this.value);
    }
}
