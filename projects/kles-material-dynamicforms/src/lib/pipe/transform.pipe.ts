import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'klesTransform' })
export class KlesTransformPipe implements PipeTransform {

    transform(value: any, pipes: { pipe: PipeTransform, options?: any[] }[]): any {

        if (pipes && pipes.length > 0) {
            return pipes.reduce((acc, p) => {
                acc = p.pipe.transform(acc, ...(p.options || []));
                return acc;
                // if (p.options) {
                //     p.options.forEach(opt => {
                //         acc = p.pipe.transform(acc, opt);
                //     });
                // } else {
                //     acc = p.pipe.transform(acc);
                // }
                // return acc;
            }, value)
        }
        return value;

    }
}
