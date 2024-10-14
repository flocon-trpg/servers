import { ReadonlyNonEmptyArray } from '@flocon-trpg/utils';
export declare const transform: <T, TKey>(state: readonly T[], stateAppliedFirst: readonly T[], stateAppliedSecond: readonly T[], getKey: (element: T) => TKey) => import("@kizahasi/result").Error<import("@kizahasi/ot-core/dist/types/internal/error").ComposeAndTransformErrorBase> | import("@kizahasi/result").Error<import("@kizahasi/ot-core").ApplyError<ReadonlyNonEmptyArray<{
    value: T;
    $tag: 0 | 1 | 2;
}>, ReadonlyNonEmptyArray<{
    value: T;
    $tag: 0 | 1 | 2;
}>>> | import("@kizahasi/result").Ok<T[]>;
//# sourceMappingURL=arrayTransform.d.ts.map