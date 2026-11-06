import { ValidatorFn } from '@angular/forms';
import { IKlesListFieldOptions } from '../interfaces/field.config.interface';

export function listFieldLimits(options: IKlesListFieldOptions = {}): { min: number; max: number } {
    const min = Number.isFinite(options.minItems) ? Math.max(0, Math.floor(options.minItems!)) : 0;
    const max = Number.isFinite(options.maxItems) ? Math.max(min, Math.floor(options.maxItems!)) : Infinity;
    return { min, max };
}

/** Count controls rather than enabled values; an empty array must also fail a positive minimum. */
export function listFieldLimitsValidator(options: IKlesListFieldOptions): ValidatorFn {
    return (control) => {
        const { min, max } = listFieldLimits(options);
        const actual = (control as { length?: number }).length ?? 0;
        if (actual < min) return { listMinItems: { required: min, actual } };
        if (actual > max) return { listMaxItems: { required: max, actual } };
        return null;
    };
}
