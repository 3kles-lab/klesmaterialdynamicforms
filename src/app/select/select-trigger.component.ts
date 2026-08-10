
import { Component, OnChanges, OnInit, SimpleChanges, Type } from "@angular/core";
import { ArrayFormatPipe, IKlesComponent } from "kles-material-dynamicforms";

@Component({
    selector: 'kles-select-trigger',
    template: `
    <span>
        {{value | arrayFormat:'BUAR'}}
    </span> 
`,
    standalone: true,
    imports: [ArrayFormatPipe]
})
export class SelectTriggerComponent implements IKlesComponent, OnInit, OnChanges {

    component: Type<any>;
    value: any;

    constructor(){
        
    }

    ngOnInit() {
        // console.log('ici Value=', this.value);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log('changes inside SelectTriggerComponent', changes)
    }


}
