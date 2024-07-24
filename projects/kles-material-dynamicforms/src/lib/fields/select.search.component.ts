import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, signal, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { BehaviorSubject, concat, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { KlesFieldAbstract } from './field.abstract';

@Component({
  selector: 'kles-form-select-search',
  // encapsulation: ViewEncapsulation.None,
  template: `
    <mat-form-field [subscriptSizing]="field.subscriptSizing" class="margin-top" [color]="field.color" [formGroup]="group" [appearance]="field.appearance">
        @if (field.label) {
            <mat-label>{{field.label}}</mat-label>
        }

        <mat-select matTooltip="{{field.tooltip}}" [attr.id]="field.id" [ngClass]="field.ngClass"
        (openedChange)="openChange($event)" [compareWith]="compareFn" [panelWidth]="field.panelWidth || 'auto'"
        [placeholder]="field.placeholder | translate" [formControlName]="field.name" [multiple]="field.multiple"  (selectionChange)="selectionChange($event)">
        @if (field.triggerComponent) {
            <mat-select-trigger>
                <ng-container klesComponent [component]="field.triggerComponent" [value]="group.controls[field.name].value" [field]="field"></ng-container>
            </mat-select-trigger>
        }

        @if (field.virtualScroll) {
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl"
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>

            <cdk-virtual-scroll-viewport [itemSize]="field.itemSize || 50" [style.height.px]=4*48>
                @if (!isLoading()) {
                    @if (field.multiple) {
                        <mat-checkbox class="selectAll mat-mdc-option mdc-list-item" [formControl]="selectAllControl" (change)="toggleAllSelection($event)">
                            {{'selectAll' | translate}}
                        </mat-checkbox>
                    }

                    @if (!field.autocompleteComponent) {
                        <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>

                        @if (field.multiple) {
                            @for (item of group.controls[field.name].value | slice:0:30; track item) {
                                <mat-option [value]="item" style="display:none">
                                    {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                                </mat-option>
                            }
                        }

                        @if (!field.multiple && group.controls[field.name].value) {
                            @for (item of [group?.controls[field.name]?.value]; track item) {
                                <mat-option [value]="item" style="display:none">
                                    {{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}
                                </mat-option>
                            }
                        }
                    }
                    @else {
                        <mat-option *cdkVirtualFor="let item of optionsFiltered$ | async" [value]="item" [disabled]="item?.disabled">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>

                        @if (field.multiple) {
                            @for (item of group.controls[field.name].value | slice:0:30; track item) {
                                <mat-option [value]="item" style="display:none">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                                </mat-option>
                            }
                        }

                        @if (!field.multiple && group.controls[field.name].value) {
                            @for (item of [group?.controls[field.name]?.value]; track item) {
                                <mat-option [value]="item" style="display:none">
                                    <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                                </mat-option>
                            }
                        }
                    }
                }
                @else {
                    <mat-option class="hide-checkbox" disabled><div class="loadingSelect">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
                }
            </cdk-virtual-scroll-viewport>
        }
        @else {
            <mat-option>
                <ngx-mat-select-search [formControl]="searchControl"
                placeholderLabel="" noEntriesFoundLabel =""></ngx-mat-select-search>
            </mat-option>

            @if (!isLoading()) {
                @if (field.multiple) {
                    <mat-checkbox class="selectAll mat-mdc-option mdc-list-item" [formControl]="selectAllControl" (change)="toggleAllSelection($event)">
                        {{'selectAll' | translate}}
                    </mat-checkbox>
                }

                @if (!field.autocompleteComponent) {
                    @for (item of optionsFiltered$ | async; track item) {
                        <mat-option [value]="item" [disabled]="item?.disabled">{{(field.property ? item[field.property] : item) | klesTransform:field.pipeTransform}}</mat-option>
                    }
                }
                @else {
                    @for (item of optionsFiltered$ | async; track item) {
                        <mat-option [value]="item" [disabled]="item?.disabled">
                            <ng-container klesComponent [component]="field.autocompleteComponent" [value]="item" [field]="field"></ng-container>
                        </mat-option>
                    }
                }
            }
            @else {
                <mat-option class="hide-checkbox" disabled><div class="loadingSelect">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
            }

            <ng-template #emptyOption>
                <mat-option class="hide-checkbox" disabled><div class="loadingSelect">{{'loading' | translate}}... <mat-spinner class="spinner" diameter="20"></mat-spinner></div></mat-option>
            </ng-template>
        }

        </mat-select>

        @if (field.hint) {
            <mat-hint>{{field.hint}}</mat-hint>
        }

        @if (field.subComponents || field.clearable || isPending()) {
          <div matSuffix class="suffix">
              @if(isPending()){
                  <mat-spinner mode="indeterminate" diameter="21"></mat-spinner>
              }
              @if(field.subComponents || field.clearable){
                  <ng-content></ng-content>
              }       
          </div>
      }

        <mat-error matErrorMessage [validations]="field.validations" [asyncValidations]="field.asyncValidations"></mat-error>
    </mat-form-field>
`,
  styles: ['mat-form-field {width: calc(100%)}',
    '::ng-deep .selectAll {padding: 0 16px 0 5px !important; display: flex !important;}',
    '::ng-deep .selectAll .mdc-form-field {width: 100%;}',
    '::ng-deep .selectAll .mdc-form-field .mdc-label {width: 100%;  min-height: 48px; align-items: center; display: flex;}',
    '::ng-deep .selectAll .mdc-form-field .mdc-checkbox__ripple {display: none !important;}',
    `::ng-deep .hide-checkbox .mat-pseudo-checkbox { display: none !important;  }`],
  styleUrls: ['../styles/loading-select.style.scss', '../styles/mat-suffix.style.scss', '../styles/mat-field-bottom.style.scss']
})
export class KlesFormSelectSearchComponent extends KlesFieldAbstract implements OnInit, OnDestroy {

  searchControl = new UntypedFormControl();
  selectAllControl = new UntypedFormControl(false);

  isLoading = signal(false);

  options$: Observable<any[]>;
  optionsFiltered$ = new ReplaySubject<any[]>(1);

  openChange$ = new BehaviorSubject<boolean>(false);
  openClosed$ = new Subject<void>();

  // private _onDestroy = new Subject<void>();

  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

  constructor(protected viewRef: ViewContainerRef, protected ref: ChangeDetectorRef) {
    super(viewRef);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.field.lazy) {
      this.isLoading.set(true);
      if (this.group.controls[this.field.name].value !== undefined && this.group.controls[this.field.name].value !== null) {
        this.options$ = new BehaviorSubject<any[]>(Array.isArray(this.group.controls[this.field.name].value) ? this.group.controls[this.field.name].value : [this.group.controls[this.field.name].value]);
        this.isLoading.set(false);
      } else {
        this.options$ = new BehaviorSubject<any[]>([]);
      }

      this.openChangeEvent();
    } else {
      if (this.field.options instanceof Observable) {
        this.options$ = this.field.options;
      }
      else if (this.field.options instanceof Function) {
        this.options$ = this.field.options();
      }
      else {
        this.options$ = of(this.field.options);
      }
    }

    this.options$.pipe(takeUntil(this._onDestroy)).subscribe((options) => {
      this.optionsFiltered$.next(options);
    });

    this.searchControl.valueChanges.pipe(
      takeUntil(this._onDestroy),
      debounceTime(this.field.debounceTime || 0),
      startWith(this.searchControl.value),
      switchMap(value => {
        return concat(
          of({ loading: true, options: [] }),
          this.onSearchChange(value).pipe(take(1), map((options) => ({ loading: false, options })))
        )
      })
    ).subscribe(({ loading, options }) => {
      this.isLoading.set(loading);
      this.optionsFiltered$.next(options);
      this.ref.markForCheck();
    });

    if (this.field.multiple) {
      this.updateSelectAllControl(this.group.controls[this.field.name].value);

      (this.group.controls[this.field.name] as FormControl).registerOnChange((values, emitViewToModelChange) => {
        if (emitViewToModelChange) {
          this.updateSelectAllControl(values);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // this._onDestroy.next();
    this.openClosed$.next();
    this.openClosed$.complete();
    super.ngOnDestroy();
  }


  toggleAllSelection(state) {
    if (state.checked) {
      this.optionsFiltered$.pipe(take(1), map((options) => options.filter((option) => !option?.disabled))).subscribe(options => {
        if (options.length > 0) {
          this.group.controls[this.field.name].patchValue(options);
        }
      });

    } else {
      this.group.controls[this.field.name].patchValue([]);
    }

    this.ref.markForCheck();
  }


  protected openChangeEvent(): void {
    this.openChange$
      .pipe(
        takeUntil(this._onDestroy),
        switchMap((isOpen) => {
          return this.onOpenChange(isOpen);
        })
      )
      .subscribe((options) => {
        this.isLoading.set(false);
        (this.options$ as BehaviorSubject<any[]>).next(options);
        this.optionsFiltered$.next(options);
        this.ref.markForCheck();
      });
  }

  protected onOpenChange(isOpen: boolean): Observable<any[]> {
    if (isOpen) {

      if (this.field.options instanceof Observable) {
        this.isLoading.set(true);
        return this.field.options.pipe(takeUntil(this.openClosed$));
      }
      else if (this.field.options instanceof Function) {
        this.isLoading.set(true);
        return this.field.options().pipe(takeUntil(this.openClosed$));
      }
      else {
        return of(this.field.options);
      }
    } else {
      return of(this.group.controls[this.field.name].value !== undefined && this.group.controls[this.field.name].value !== null
        ? (Array.isArray(this.group.controls[this.field.name].value) ?
          this.group.controls[this.field.name].value : [this.group.controls[this.field.name].value]) : [])
    }
  }

  protected onSearchChange(value: string): Observable<any[]> {
    if (value) {
      const search = value.toLowerCase();
      return this.options$.pipe(map(options => {
        return options
          .filter(option => {
            if (this.field.searchKeys && this.field.searchKeys.length) {
              return this.field.searchKeys.some(searchKey => {
                if (option[searchKey]) {
                  return option[searchKey]?.toString().toLowerCase().indexOf(search) > -1;
                }
                return false;
              }) || (this.field.property ?
                option[this.field.property]?.toString().toLowerCase().indexOf(search) > -1 : false);

            } else {
              if (this.field.property) {
                return option[this.field.property]?.toString().toLowerCase().indexOf(search) > -1;
              }
            }
            return option?.toString().toLowerCase().indexOf(search) > -1;
          });
      }));
    } else {
      return this.options$;
    }
  }

  openChange($event: boolean) {
    if (this.field.lazy) {
      if (!$event) {
        this.openClosed$.next();
      }
      this.openChange$.next($event);
    }

    if (this.field.virtualScroll) {
      if ($event) {
        this.cdkVirtualScrollViewport.scrollToIndex(0);
        this.cdkVirtualScrollViewport.checkViewportSize();
      }
    }
  }

  compareFn = (o1: any, o2: any) => {
    if (this.field.property && o1 && o2) {
      return o1[this.field.property] === o2[this.field.property];
    }
    return o1 === o2;
  }

  selectionChange(selection) {
    if (this.field.multiple) {
      this.updateSelectAllControl(selection.value);
    }

  }

  updateSelectAllControl(values): void {
    if (values) {
      const selected = ((this.field.property && values) ? values?.map(s => s[this.field.property]) : values);
      this.optionsFiltered$.pipe(
        take(1),
        map((options) => options?.filter((option) => !option?.disabled).map((option) => (this.field.property ? option[this.field.property] : option))),
        map(options => {
          if (!selected) {
            return false;
          }

          if (options.length < selected.length) {
            return options.length > 0 && options.every(o => selected.includes(o));
          } else {
            return options.length > 0 && options.length === selected.length && selected.every(s => options.includes(s));
          }
        })).subscribe(isChecked => {
          this.selectAllControl.setValue(isChecked, { emitEvent: false });
        });
    }

  }
}
