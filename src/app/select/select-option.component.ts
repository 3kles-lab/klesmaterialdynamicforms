import { Component, OnInit, Type, ChangeDetectionStrategy } from "@angular/core";
import { IKlesComponent } from "dist/kles-material-dynamicforms";

@Component({
    selector: 'kles-select-option',
    template: `
    <span>
        {{value.BUAR}} - {{value.TX40}}
    </span> 
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class SelectOptionComponent implements IKlesComponent, OnInit {

    component: Type<any>;
    value: any;

    constructor(){
        
    }

    ngOnInit() {
        // console.log('ici Value=', this.value);
    }


}