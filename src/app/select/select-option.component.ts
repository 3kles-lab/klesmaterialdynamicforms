import { Component, OnInit, Type } from "@angular/core";
import { IKlesComponent } from "dist/kles-material-dynamicforms/public-api";

@Component({
    selector: 'kles-select-option',
    template: `
    <span>
        {{value.BUAR}} - {{value.TX40}}
    </span> 
`
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