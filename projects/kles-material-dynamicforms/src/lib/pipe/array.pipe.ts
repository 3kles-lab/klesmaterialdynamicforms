import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'arrayFormat' })
export class ArrayFormatPipe implements PipeTransform {

    transform(values: any[], property?: string): string {
        if (values && Array.isArray(values)) {
            if (property) {
                return values.map(value => value[property]).filter(Boolean).join(', ');
            } else {
                return values.join(', ');
            }
        }
        return '';
    }
}