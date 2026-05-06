import { KlesMatDatepickerIntl } from '@3kles/kles-material-datepicker';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DatePickerIntl extends KlesMatDatepickerIntl {
    override validateCalendarLabel = 'ok';
    override cancelCalendarLabel = 'annuler';
    override timePickerTextLabel = 'temps';
}
