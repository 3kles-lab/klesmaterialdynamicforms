import { AbstractControl, ValidatorFn } from "@angular/forms"

export function autocompleteObjectValidator(optional?: boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (control.value === null && !optional) return { 'invalidAutocompleteObject': { value: control.value } }

        if (typeof control.value === 'string') {
            if (control.value === '' && optional) return null;
            return { 'invalidAutocompleteObject': { value: control.value } }
        }
        return null  /* valid option selected */
    }
}

export function autocompleteStringValidator(validOptions: Array<string>, optional?: boolean): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if ((control.value === '' || control.value === null) && optional) return null;
        if (validOptions.indexOf(control.value) !== -1) {
            return null  /* valid option selected */
        }
        return { 'invalidAutocompleteString': { value: control.value } }
    }
}