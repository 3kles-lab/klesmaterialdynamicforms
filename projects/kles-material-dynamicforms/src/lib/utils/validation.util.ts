import { IKlesValidator, KlesValidationKey } from '../interfaces/validator.interface';

export function flattenValidators<T>(validations: IKlesValidator<T>[]): KlesValidationKey[] {
    return validations.flatMap((v) => ('keys' in v ? (v.keys ?? []) : [{ name: v.name, message: v.message, messageKey: v.messageKey }]));
}
