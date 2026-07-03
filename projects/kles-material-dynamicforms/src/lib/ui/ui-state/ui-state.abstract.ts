import { EventEmitter, Signal, signal } from '@angular/core';
import { ɵGetProperty } from '@angular/forms';

export abstract class AbstractUiState<TValue = any, TRawValue extends TValue = TValue> {
    protected _value = signal<TValue | undefined>(undefined);

    private _parent: AbstractUiState<any> | null = null;
    private _parentKey: string | number | null = null;

    get<P extends string | readonly (string | number)[]>(path: P): AbstractUiState<ɵGetProperty<TRawValue, P>> | null;
    get<P extends string | Array<string | number>>(path: P): AbstractUiState<ɵGetProperty<TRawValue, P>> | null;
    get<P extends string | (string | number)[]>(path: P): AbstractUiState<ɵGetProperty<TRawValue, P>> | null {
        let currPath: Array<string | number> | string = path;
        if (currPath == null) return null;
        if (!Array.isArray(currPath)) currPath = currPath.split('.').filter(Boolean);
        if (currPath.length === 0) return null;
        return currPath.reduce((uiState: AbstractUiState | null, name) => uiState && uiState._find(name), this);
    }

    _find(name: string | number): AbstractUiState | null {
        return null;
    }

    abstract setValue(value: TRawValue): void;

    abstract patchValue(value: Partial<TValue>): void;

    get value(): Signal<TValue | undefined> {
        return this._value.asReadonly();
    }

    setParent(parent: AbstractUiState<any>, key: string | number): void {
        this._parent = parent;
        this._parentKey = key;
    }

    protected notifyParent(): void {
        if (this._parent && this._parentKey != null) {
            this._parent.childValueChanged(this._parentKey, this._value());
        }
    }

    childValueChanged(key: string | number, value: any): void {
        // par défaut, rien
    }
}
