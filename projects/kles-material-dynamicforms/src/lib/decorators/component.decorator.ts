import { Type } from '@angular/core';

export const componentMapper: { component: Type<any>; type: string }[] = [];

export function FieldMapper(config: {type: string}){
    return (target: Type<any>) => {
        componentMapper.push({ component: target, type: config.type });
    };
}
