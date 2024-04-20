/*
 * Public API Surface of kles-material-dynamicforms
 */

export * from './lib/kles-material-dynamicforms.module';

/**DIRECTIVE */
export * from './lib/directive/dynamic-field.directive';
export * from './lib/directive/dynamic-component.directive';
export * from './lib/directive/mat-error-message.directive';

/*FORMS*/
export * from './lib/forms/button-control-base';
export * from './lib/forms/button-control.component';
export * from './lib/forms/buttonchecker-control.component';
export * from './lib/forms/buttonfile-control.component';
export * from './lib/forms/fab-control.component';
export * from './lib/forms/mini-fab-control.component';
export * from './lib/forms/icon-button-control.component';

/**FIELDS */
export * from './lib/fields/badge.component';
export * from './lib/fields/button-form.component';
export * from './lib/fields/buttonchecker-form.component';
export * from './lib/fields/buttonfile-form.component';
export * from './lib/fields/checkbox.component';
export * from './lib/fields/color.component';
export * from './lib/fields/date.component';
export * from './lib/fields/field.abstract';
export * from './lib/fields/input.component';
export * from './lib/fields/input.clearable.component';
export * from './lib/fields/label.component';
export * from './lib/fields/list-field.component';
export * from './lib/fields/radio.component';
export * from './lib/fields/select.component';
export * from './lib/fields/textarea.component';
export * from './lib/fields/text.component';
export * from './lib/fields/chip.component';
export * from './lib/fields/group.component';
export * from './lib/fields/icon.component';
export * from './lib/fields/select.search.component';
export * from './lib/fields/line-break.component';
export * from './lib/fields/link.component';
export * from './lib/fields/slide-toggle.component';
export * from './lib/fields/selection-list.component';
export * from './lib/fields/button-toogle-group.component';
export * from './lib/fields/array.component';
export * from './lib/fields/range.component';
export * from './lib/fields/clear.component';
export * from './lib/fields/select.lazy-search.component';
export * from './lib/fields/date-time.component';
export * from './lib/fields/button-fab.component';
export * from './lib/fields/button-mini-fab.component';
export * from './lib/fields/button-icon.component';
export * from './lib/fields/selection-list.search.component';

/**ENUMS */
export * from './lib/enums/type.enum';
export * from './lib/enums/button-attribute.enum';

/**INTERFACES */
export * from './lib/interfaces/component.interface';
export * from './lib/interfaces/field.interface';
export * from './lib/interfaces/field.config.interface';
export * from './lib/interfaces/validator.interface';
export * from './lib/interfaces/directive.interface';
export * from './lib/interfaces/clear-control.interface';

/**MATCHER */
export * from './lib/matcher/form-error.matcher';

/**VALIDATORS */
export * from './lib/validators/autocomplete.validator';

/**FORM */
export * from './lib/dynamic-form.component';

/**PIPES */
export * from './lib/pipe/array.pipe';
export * from './lib/pipe/transform.pipe';

/**DECORATORS */
export * from './lib/decorators/component.decorator';

/**FACTORIES */
export * from './lib/factories/field.factory';

/**CONTROLS */
export * from './lib/controls/array.control';
export * from './lib/controls/control.interface';
export * from './lib/controls/default.control';
export * from './lib/controls/group.control';
export * from './lib/controls/range.control';
