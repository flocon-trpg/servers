import { ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-core';
import {
    NonEmptyString,
    applyAndRestore,
    applyBackAndRestore,
    applyBack as applyBackCore,
    apply as applyCore,
    composeDownOperation as composeDownOperationCore,
    composeUpOperation as composeUpOperationCore,
    deserializeDownOperation,
    deserializeTwoWayOperation,
    deserializeUpOperation,
    diff as diffCore,
    serializeDownOperation,
    serializeTwoWayOperation,
    serializeUpOperation,
    toDownOperation as toDownOperationCore,
    toUpOperation as toUpOperationCore,
    transformTwoWayOperation,
    transformUpOperation,
} from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';
import { z } from 'zod';

const r = 'r';
const i = 'i';
const d = 'd';

const downOperationUnit = z.union([
    z.object({
        t: z.literal(r),
        r: z.number(),
    }),
    z.object({
        t: z.literal(i),
        i: z.number(),
    }),
    z.object({
        t: z.literal(d),
        d: z.string(),
    }),
]);

export const downOperation = z.array(downOperationUnit);
export type DownOperation = z.TypeOf<typeof downOperation>;

const upOperationUnit = z.union([
    z.object({
        t: z.literal(r),
        r: z.number(),
    }),
    z.object({
        t: z.literal(i),
        i: z.string(),
    }),
    z.object({
        t: z.literal(d),
        d: z.number(),
    }),
]);

export const upOperation = z.array(upOperationUnit);
export type UpOperation = z.TypeOf<typeof upOperation>;

export type TwoWayOperation = (
    | {
          t: typeof r;
          r: number;
      }
    | {
          t: typeof i;
          i: string;
      }
    | {
          t: typeof d;
          d: string;
      }
)[];

export const apply = (state: string, action: UpOperation | TwoWayOperation) => {
    const action$ = deserializeUpOperation(action);
    if (action$ == null) {
        return Result.ok(state);
    }
    return applyCore({
        prevState: state,
        upOperation: action$,
    });
};

export const applyBack = (state: string, action: DownOperation) => {
    const action$ = deserializeDownOperation(action);
    if (action$ == null) {
        return Result.ok(state);
    }
    return applyBackCore({
        nextState: state,
        downOperation: action$,
    });
};

export const composeUpOperation = (
    first: UpOperation | undefined,
    second: UpOperation | undefined,
): Result<UpOperation | undefined, ComposeAndTransformError<NonEmptyString, PositiveInt>> => {
    const first$ = first == null ? undefined : deserializeUpOperation(first);
    const second$ = second == null ? undefined : deserializeUpOperation(second);
    if (first$ == null) {
        return Result.ok(second);
    }
    if (second$ == null) {
        return Result.ok(first);
    }
    const result = composeUpOperationCore({
        first: first$,
        second: second$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(serializeUpOperation(result.value));
};

export const composeDownOperation = (
    first: DownOperation | undefined,
    second: DownOperation | undefined,
): Result<DownOperation | undefined, ComposeAndTransformError<PositiveInt, NonEmptyString>> => {
    const first$ = first == null ? undefined : deserializeDownOperation(first);
    const second$ = second == null ? undefined : deserializeDownOperation(second);
    if (first$ == null) {
        return Result.ok(second);
    }
    if (second$ == null) {
        return Result.ok(first);
    }
    const result = composeDownOperationCore({
        first: first$,
        second: second$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(serializeDownOperation(result.value));
};

export const restore = ({
    nextState,
    downOperation,
}: {
    nextState: string;
    downOperation: DownOperation | undefined;
}) => {
    const downOperation$ =
        downOperation == null ? undefined : deserializeDownOperation(downOperation);
    if (downOperation$ == null) {
        return Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const result = applyBackAndRestore({
        nextState,
        downOperation: downOperation$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        prevState: result.value.prevState,
        twoWayOperation: serializeTwoWayOperation(result.value.restored),
    });
};

// 元々はこの関数自身がserverTransformとしてexportされていたが、firstPrimeは必要ないためexportを外した。ただし将来使うことがあるかもしれないため一応残している。
const serverTransformCore = ({
    first,
    second,
    prevState,
}: {
    first?: TwoWayOperation;
    second?: UpOperation;
    prevState: string;
}) => {
    const first$ = first == null ? undefined : deserializeTwoWayOperation(first);
    if (first$ === undefined) {
        const second$ = second == null ? undefined : deserializeUpOperation(second);
        if (second$ === undefined) {
            return Result.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        const restoreResult = applyAndRestore({
            prevState,
            upOperation: second$,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }
        return Result.ok({
            firstPrime: undefined,
            secondPrime: serializeTwoWayOperation(restoreResult.value.restored),
        });
    }
    const second$ = second == null ? undefined : deserializeUpOperation(second);
    if (second$ === undefined) {
        return Result.ok({
            firstPrime: first$,
            secondPrime: undefined,
        });
    }
    const secondResult = applyAndRestore({
        prevState,
        upOperation: second$,
    });
    if (secondResult.isError) {
        return secondResult;
    }
    const result = transformTwoWayOperation({
        first: first$,
        second: secondResult.value.restored,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        firstPrime: serializeTwoWayOperation(result.value.firstPrime),
        secondPrime: serializeTwoWayOperation(result.value.secondPrime),
    });
};

export const serverTransform = ({
    first,
    second,
    prevState,
}: {
    first?: TwoWayOperation;
    second?: UpOperation;
    prevState: string;
}) => {
    const result = serverTransformCore({ first, second, prevState });
    if (result.isError) {
        return result;
    }
    return Result.ok(result.value.secondPrime);
};

export const clientTransform = ({
    first,
    second,
}: {
    first?: UpOperation;
    second?: UpOperation;
}) => {
    const first$ = first == null ? undefined : deserializeUpOperation(first);
    if (first$ === undefined) {
        const second$ = second == null ? undefined : deserializeUpOperation(second);
        if (second$ === undefined) {
            return Result.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        return Result.ok({
            firstPrime: undefined,
            secondPrime: serializeUpOperation(second$),
        });
    }
    const second$ = second == null ? undefined : deserializeUpOperation(second);
    if (second$ === undefined) {
        return Result.ok({
            firstPrime: serializeUpOperation(first$),
            secondPrime: undefined,
        });
    }
    const result = transformUpOperation({
        first: first$,
        second: second$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        firstPrime: serializeUpOperation(result.value.firstPrime),
        secondPrime: serializeUpOperation(result.value.secondPrime),
    });
};

export const diff = ({
    prev,
    next,
}: {
    prev: string;
    next: string;
}): TwoWayOperation | undefined => {
    if (prev === next) {
        return undefined;
    }
    return serializeTwoWayOperation(
        diffCore({
            prevState: prev,
            nextState: next,
        }),
    );
};

const diffToUpOperation = ({
    prev,
    next,
}: {
    prev: string;
    next: string;
}): UpOperation | undefined => {
    if (prev === next) {
        return undefined;
    }
    const twoWayOperation = diffCore({
        prevState: prev,
        nextState: next,
    });
    const upOperation = toUpOperationCore(twoWayOperation);
    return serializeUpOperation(upOperation);
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    const twoWayOperation = deserializeTwoWayOperation(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const upOperation = toUpOperationCore(twoWayOperation);
    return serializeUpOperation(upOperation);
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    const twoWayOperation = deserializeTwoWayOperation(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const downOperation = toDownOperationCore(twoWayOperation);
    return serializeDownOperation(downOperation);
};

// Ensure this:
// - diff(oldValue) = newValue
export const toPrivateClientOperation = ({
    oldValue,
    newValue,
    diff,
    isAuthorized,
}: {
    oldValue: {
        isValuePrivate: boolean;
        value: string;
    };
    newValue: {
        isValuePrivate: boolean;
        value: string;
    };
    diff: TwoWayOperation | undefined;
    isAuthorized: boolean;
}): UpOperation | undefined => {
    if (oldValue.isValuePrivate && !isAuthorized) {
        if (newValue.isValuePrivate) {
            return undefined;
        }
        return diffToUpOperation({ prev: '', next: newValue.value });
    }
    if (newValue.isValuePrivate && !isAuthorized) {
        return diffToUpOperation({ prev: oldValue.value, next: '' });
    }
    if (diff == null) {
        return undefined;
    }
    return toUpOperation(diff);
};
