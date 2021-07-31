import { CustomResult, Result } from '@kizahasi/result';
import * as t from 'io-ts';
import * as TextOperationCore from '@kizahasi/ot-string';

const r = 'r';
const i = 'i';
const d = 'd';

const downOperationUnit = t.union([
    t.type({
        t: t.literal(r),
        r: t.number,
    }),
    t.type({
        t: t.literal(i),
        i: t.number,
    }),
    t.type({
        t: t.literal(d),
        d: t.string,
    }),
]);

export const downOperation = t.array(downOperationUnit);
export type DownOperation = t.TypeOf<typeof downOperation>;

const upOperationUnit = t.union([
    t.type({
        t: t.literal(r),
        r: t.number,
    }),
    t.type({
        t: t.literal(i),
        i: t.string,
    }),
    t.type({
        t: t.literal(d),
        d: t.number,
    }),
]);

export const upOperation = t.array(upOperationUnit);
export type UpOperation = t.TypeOf<typeof upOperation>;

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
    const action$ = TextOperationCore.TextUpOperation.ofUnit(action);
    if (action$ == null) {
        return Result.ok(state);
    }
    return TextOperationCore.TextUpOperation.apply({
        prevState: state,
        action: action$,
    });
};

export const applyBack = (state: string, action: DownOperation) => {
    const action$ = TextOperationCore.TextDownOperation.ofUnit(action);
    if (action$ == null) {
        return Result.ok(state);
    }
    return TextOperationCore.TextDownOperation.applyBack({
        nextState: state,
        action: action$,
    });
};

export const composeUpOperation = (
    first: UpOperation | undefined,
    second: UpOperation | undefined
): CustomResult<UpOperation | undefined, TextOperationCore.ComposeAndTransformError> => {
    const first$ = first == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(first);
    const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
    if (first$ == null) {
        return Result.ok(second);
    }
    if (second$ == null) {
        return Result.ok(first);
    }
    const result = TextOperationCore.TextUpOperation.compose({
        first: first$,
        second: second$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(TextOperationCore.TextUpOperation.toUnit(result.value));
};

export const composeDownOperation = (
    first: DownOperation | undefined,
    second: DownOperation | undefined
): CustomResult<DownOperation | undefined, TextOperationCore.ComposeAndTransformError> => {
    const first$ = first == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(first);
    const second$ = second == null ? undefined : TextOperationCore.TextDownOperation.ofUnit(second);
    if (first$ == null) {
        return Result.ok(second);
    }
    if (second$ == null) {
        return Result.ok(first);
    }
    const result = TextOperationCore.TextDownOperation.compose({
        first: first$,
        second: second$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok(TextOperationCore.TextDownOperation.toUnit(result.value));
};

export const restore = ({
    nextState,
    downOperation,
}: {
    nextState: string;
    downOperation: DownOperation | undefined;
}) => {
    const downOperation$ =
        downOperation == null
            ? undefined
            : TextOperationCore.TextDownOperation.ofUnit(downOperation);
    if (downOperation$ == null) {
        return Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    const result = TextOperationCore.TextDownOperation.applyBackAndRestore({
        nextState,
        action: downOperation$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        prevState: result.value.prevState,
        twoWayOperation: TextOperationCore.TextTwoWayOperation.toUnit(result.value.restored),
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
    const first$ = first == null ? undefined : TextOperationCore.TextTwoWayOperation.ofUnit(first);
    if (first$ === undefined) {
        const second$ =
            second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
        if (second$ === undefined) {
            return Result.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        const restoreResult = TextOperationCore.TextUpOperation.applyAndRestore({
            prevState,
            action: second$,
        });
        if (restoreResult.isError) {
            return restoreResult;
        }
        return Result.ok({
            firstPrime: undefined,
            secondPrime: TextOperationCore.TextTwoWayOperation.toUnit(restoreResult.value.restored),
        });
    }
    const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
    if (second$ === undefined) {
        return Result.ok({
            firstPrime: first$,
            secondPrime: undefined,
        });
    }
    const secondResult = TextOperationCore.TextUpOperation.applyAndRestore({
        prevState,
        action: second$,
    });
    if (secondResult.isError) {
        return secondResult;
    }
    const result = TextOperationCore.TextTwoWayOperation.serverTransform({
        first: first$,
        second: secondResult.value.restored,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        firstPrime: TextOperationCore.TextTwoWayOperation.toUnit(result.value.firstPrime),
        secondPrime: TextOperationCore.TextTwoWayOperation.toUnit(result.value.secondPrime),
    });
};

export const clientTransform = ({
    first,
    second,
}: {
    first?: UpOperation;
    second?: UpOperation;
}) => {
    const first$ = first == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(first);
    if (first$ === undefined) {
        const second$ =
            second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
        if (second$ === undefined) {
            return Result.ok({
                firstPrime: undefined,
                secondPrime: undefined,
            });
        }
        return Result.ok({
            firstPrime: undefined,
            secondPrime: TextOperationCore.TextUpOperation.toUnit(second$),
        });
    }
    const second$ = second == null ? undefined : TextOperationCore.TextUpOperation.ofUnit(second);
    if (second$ === undefined) {
        return Result.ok({
            firstPrime: TextOperationCore.TextUpOperation.toUnit(first$),
            secondPrime: undefined,
        });
    }
    const result = TextOperationCore.TextUpOperation.transform({
        first: first$,
        second: second$,
    });
    if (result.isError) {
        return result;
    }
    return Result.ok({
        firstPrime: TextOperationCore.TextUpOperation.toUnit(result.value.firstPrime),
        secondPrime: TextOperationCore.TextUpOperation.toUnit(result.value.secondPrime),
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
    return TextOperationCore.TextTwoWayOperation.toUnit(
        TextOperationCore.TextTwoWayOperation.diff({
            first: prev,
            second: next,
        })
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
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.diff({
        first: prev,
        second: next,
    });
    const upOperation = TextOperationCore.TextTwoWayOperation.toUpOperation(twoWayOperation);
    return TextOperationCore.TextUpOperation.toUnit(upOperation);
};

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.ofUnit(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const upOperation = TextOperationCore.TextTwoWayOperation.toUpOperation(twoWayOperation);
    return TextOperationCore.TextUpOperation.toUnit(upOperation);
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    const twoWayOperation = TextOperationCore.TextTwoWayOperation.ofUnit(source);
    if (twoWayOperation == null) {
        throw new Error('This should not happen');
    }
    const downOperation = TextOperationCore.TextTwoWayOperation.toDownOperation(twoWayOperation);
    return TextOperationCore.TextDownOperation.toUnit(downOperation);
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
        if (newValue.isValuePrivate && !isAuthorized) {
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
