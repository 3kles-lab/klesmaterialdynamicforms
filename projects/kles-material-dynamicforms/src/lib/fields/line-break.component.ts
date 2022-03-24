import { Component, OnDestroy, OnInit } from "@angular/core";
import { KlesFieldAbstract } from "./field.abstract";

@Component({
    selector: "kles-form-line-break",
    template: ``,
    styles: [
        `:host{
            flex-basis: 100%;
            display: flex;
            height:0;
        }`
    ]
})
export class KlesFormLineBreakComponent extends KlesFieldAbstract implements OnInit, OnDestroy {
    ngOnInit() { super.ngOnInit(); }
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
