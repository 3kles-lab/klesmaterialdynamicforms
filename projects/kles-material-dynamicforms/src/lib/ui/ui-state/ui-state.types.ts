/** Selects the untyped result when T is `any`, otherwise the typed result. */
export type KlesTypedOrUntyped<T, TTyped, TUntyped> = 0 extends 1 & T ? TUntyped : TTyped;

type KlesPathSegment = string | number;

type KlesTokenize<TPath extends string> = TPath extends `${infer THead}.${infer TTail}`
    ? [THead, ...KlesTokenize<TTail>]
    : [TPath];

type KlesCoercePathSegment<TSegment> = TSegment extends `${infer TIndex extends number}` ? TIndex : TSegment;

type KlesProperty<TValue, TKey> = TValue extends unknown
    ? KlesCoercePathSegment<TKey> extends keyof TValue
        ? TValue[KlesCoercePathSegment<TKey>]
        : never
    : never;

type KlesNavigate<TValue, TPath extends readonly KlesPathSegment[]> = number extends TPath['length']
    ? any
    : TPath extends readonly [infer THead extends KlesPathSegment, ...infer TTail extends KlesPathSegment[]]
      ? KlesNavigate<KlesProperty<TValue, THead>, TTail>
      : TValue;

/** Resolves the value located at a dot-separated path or an array of path segments. */
export type KlesGetProperty<TValue, TPath> = KlesTypedOrUntyped<
    TValue,
    TPath extends string
        ? string extends TPath
            ? any
            : KlesNavigate<TValue, KlesTokenize<TPath>>
        : TPath extends readonly KlesPathSegment[]
          ? KlesNavigate<TValue, TPath>
          : never,
    any
>;
