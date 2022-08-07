import { Directive, Inject, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { IKlesDirective, IKlesField } from 'kles-material-dynamicforms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive()
export class PeekABooDirective implements IKlesDirective, OnInit, OnDestroy {

    private _onDestroy = new Subject<void>();

    constructor(private viewRef: ViewContainerRef, @Inject(Type) private klesField: IKlesField) { }

    ngOnInit() {
        this.klesField.group.controls[this.klesField.field.name].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(value => {
                if (value === 'peek') {
                    this.viewRef.element.nativeElement.style.color = 'red';
                } else {
                    this.viewRef.element.nativeElement.style.color = 'black';
                }
            });
    }

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

}
