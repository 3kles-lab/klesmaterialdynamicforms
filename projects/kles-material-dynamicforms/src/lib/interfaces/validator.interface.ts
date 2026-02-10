type Exclusive<T, U> = (T & { [K in keyof U]?: never }) | (U & { [K in keyof T]?: never });

export type KlesValidationKey = {
    name: string;
    message?: string;
    messageKey?: string;
};

type KlesValidatorMultiple = {
    keys: KlesValidationKey[];
};

export type IKlesValidator<T> = { validator: T } & Exclusive<KlesValidationKey, KlesValidatorMultiple>;
