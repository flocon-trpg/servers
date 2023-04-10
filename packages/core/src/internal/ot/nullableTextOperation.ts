import * as TextOperationCore from '@kizahasi/ot-core';
import { NonEmptyString } from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { replace, update } from './recordOperationElement';
import * as TextOperation from './textOperation';

// CONSIDER: keyが1つのみのrecordOperationを用いることでこのコードを大幅に簡略化できないか？

const stateShouldNotBeUndefinedMessage = 'state should not be undefined';
const firstTypeShouldBeSameAsSecondType = 'first type and second type should be same';

const stringOrUndefined = z.union([z.string(), z.undefined()]);

type ApplyError = TextOperationCore.ApplyError<NonEmptyString, TextOperationCore.PositiveInt>;
type ComposeAndTransformUpError = TextOperationCore.ComposeAndTransformError<
    TextOperationCore.PositiveInt,
    NonEmptyString
>;
type ComposeAndTransformDownError = TextOperationCore.ComposeAndTransformError<
    NonEmptyString,
    TextOperationCore.PositiveInt
>;
type ComposeAndTransformTwoWayError = TextOperationCore.ComposeAndTransformError<
    NonEmptyString,
    NonEmptyString
>;

export const downOperation = z.union([
    z.object({
        type: z.literal(replace),
        replace: z.object({
            oldValue: stringOrUndefined,
        }),
    }),
    z.object({
        type: z.literal(update),
        update: TextOperation.downOperation,
    }),
]);
export type DownOperation = z.TypeOf<typeof downOperation>;

export const upOperation = z.union([
    z.object({
        type: z.literal(replace),
        replace: z.object({
            newValue: stringOrUndefined,
        }),
    }),
    z.object({
        type: z.literal(update),
        update: TextOperation.upOperation,
    }),
]);

export type UpOperation = z.TypeOf<typeof upOperation>;

export type TwoWayOperation =
    | {
          type: typeof replace;
          replace:
              | {
                    oldValue: string;
                    newValue: undefined;
                }
              | {
                    oldValue: undefined;
                    newValue: string;
                };
      }
    | {
          type: typeof update;
          update: TextOperation.TwoWayOperation;
      };

export const toUpOperation = (source: TwoWayOperation): UpOperation => {
    if (source.type === replace) {
        return {
            type: replace,
            replace: {
                newValue: source.replace.newValue,
            },
        };
    }
    return {
        type: update,
        update: TextOperation.toUpOperation(source.update),
    };
};

export const toDownOperation = (source: TwoWayOperation): DownOperation => {
    if (source.type === replace) {
        return {
            type: replace,
            replace: {
                oldValue: source.replace.oldValue,
            },
        };
    }
    return {
        type: update,
        update: TextOperation.toDownOperation(source.update),
    };
};

export const apply = (state: string | undefined, action: UpOperation | TwoWayOperation) => {
    if (action.type === replace) {
        return Result.ok(action.replace.newValue);
    }
    if (state == null) {
        return Result.error(stateShouldNotBeUndefinedMessage);
    }
    return TextOperation.apply(state, action.update);
};

export const applyBack = (state: string | undefined, action: DownOperation) => {
    if (action.type === replace) {
        return Result.ok(action.replace.oldValue);
    }
    if (state == null) {
        return Result.error(stateShouldNotBeUndefinedMessage);
    }
    return TextOperation.applyBack(state, action.update);
};

// stateが必要ないため処理を高速化&簡略化できるが、その代わり戻り値のreplaceにおいて oldValue === undefined && newValue === undefined もしくは oldValue !== undefined && newValue !== undefinedになるケースがある。
export const composeDownOperation = (
    first: DownOperation | undefined,
    second: DownOperation | undefined
): Result<DownOperation | undefined, string | ApplyError | ComposeAndTransformUpError> => {
    if (first == null) {
        return Result.ok(second);
    }
    if (second == null) {
        return Result.ok(first);
    }
    switch (first.type) {
        case replace:
            return Result.ok(first);
        case update:
            switch (second.type) {
                case replace: {
                    if (second.replace.oldValue == null) {
                        return Result.error(
                            'Because first is update, second.oldValue should not be undefined'
                        );
                    }
                    const oldValue = TextOperation.applyBack(second.replace.oldValue, first.update);
                    if (oldValue.isError) {
                        return oldValue;
                    }
                    return Result.ok({
                        type: replace,
                        replace: {
                            oldValue: oldValue.value,
                        },
                    });
                }
                case 'update': {
                    const composed = TextOperation.composeDownOperation(
                        first.update,
                        second.update
                    );
                    if (composed.isError) {
                        return composed;
                    }
                    if (composed.value == null) {
                        return Result.ok(undefined);
                    }
                    return Result.ok({
                        type: update,
                        update: composed.value,
                    });
                }
            }
    }
};

export const diff = ({
    prev,
    next,
}: {
    prev: string | undefined;
    next: string | undefined;
}): TwoWayOperation | undefined => {
    if (prev == null) {
        if (next == null) {
            return undefined;
        }
        return {
            type: replace,
            replace: {
                oldValue: prev,
                newValue: next,
            },
        };
    }
    if (next == null) {
        return {
            type: replace,
            replace: {
                oldValue: prev,
                newValue: next,
            },
        };
    }
    const diff = TextOperation.diff({ prev, next });
    if (diff == null) {
        return undefined;
    }
    return {
        type: update,
        update: diff,
    };
};

// composeDownOperationは、時系列順でremove→addしたものをcomposeすると、本来はupdateになるべきだが、replaceになってしまうという仕様がある。だが、このrestore関数ではそれをupdateに変換してくれる。
export const restore = ({
    nextState,
    downOperation,
}: {
    nextState: string | undefined;
    downOperation: DownOperation | undefined;
}): Result<
    {
        prevState: string | undefined;
        twoWayOperation: TwoWayOperation | undefined;
    },
    string | ApplyError
> => {
    if (downOperation == null) {
        return Result.ok({
            prevState: nextState,
            twoWayOperation: undefined,
        });
    }
    if (downOperation.type === replace) {
        return Result.ok({
            prevState: downOperation.replace.oldValue,
            twoWayOperation: diff({ prev: downOperation.replace.oldValue, next: nextState }),
        });
    }

    if (nextState == null) {
        return Result.error(stateShouldNotBeUndefinedMessage);
    }
    const restoredResult = TextOperation.restore({
        nextState,
        downOperation: downOperation.update,
    });
    if (restoredResult.isError) {
        return restoredResult;
    }
    return Result.ok({
        prevState: restoredResult.value.prevState,
        twoWayOperation:
            restoredResult.value.twoWayOperation == null
                ? undefined
                : {
                      type: update,
                      update: restoredResult.value.twoWayOperation,
                  },
    });
};

export const serverTransform = ({
    first,
    second,
    prevState,
}: {
    first?: TwoWayOperation;
    second?: UpOperation;
    prevState: string | undefined;
}): Result<TwoWayOperation | undefined, string | ApplyError | ComposeAndTransformTwoWayError> => {
    if (second == null) {
        return Result.ok(undefined);
    }

    if (second.type === replace) {
        const oldValue = prevState;
        const newValue = second.replace.newValue;
        if (oldValue == null) {
            if (newValue == null) {
                return Result.ok(undefined);
            }
            return Result.ok({
                type: replace,
                replace: {
                    oldValue,
                    newValue,
                },
            });
        }
        if (newValue == null) {
            return Result.ok({
                type: replace,
                replace: {
                    oldValue,
                    newValue,
                },
            });
        }

        const diff = TextOperation.diff({ prev: oldValue, next: newValue });
        if (diff == null) {
            return Result.ok(undefined);
        }
        return Result.ok({
            type: update,
            update: diff,
        });
    }

    if (prevState == null) {
        return Result.error(stateShouldNotBeUndefinedMessage);
    }

    if (first?.type === replace) {
        return Result.error(firstTypeShouldBeSameAsSecondType);
    }

    const xformResult = TextOperation.serverTransform({
        first: first?.update,
        second: second.update,
        prevState: prevState,
    });
    if (xformResult.isError) {
        return xformResult;
    }
    if (xformResult.value == null) {
        return Result.ok(undefined);
    }
    return Result.ok({
        type: update,
        update: xformResult.value,
    });
};

export const clientTransform = ({
    first,
    second,
}: {
    first: UpOperation | undefined;
    second: UpOperation | undefined;
}): Result<
    {
        firstPrime?: UpOperation;
        secondPrime?: UpOperation;
    },
    string | ComposeAndTransformDownError
> => {
    if (first == null || second == null) {
        return Result.ok({
            firstPrime: first,
            secondPrime: second,
        });
    }

    if (first.type === replace) {
        if (second.type === update) {
            if (first.replace.newValue != null) {
                throw new Error(
                    'because second is update, first replace.newValue must not be undefined'
                );
            }
            return Result.ok({
                firstPrime: first,
            });
        }

        if (first.replace.newValue == null) {
            if (second.replace.newValue != null) {
                throw new Error('first or second should be update');
            }
            return Result.ok({});
        }
        if (second.replace.newValue == null) {
            throw new Error('first or second should be update');
        }
        const diff = TextOperation.diff({
            prev: second.replace.newValue,
            next: first.replace.newValue,
        });
        return Result.ok({
            firstPrime:
                diff == null
                    ? undefined
                    : {
                          type: update,
                          update: TextOperation.toUpOperation(diff),
                      },
        });
    }

    if (second.type === update) {
        const xformResult = TextOperation.clientTransform({
            first: first.update,
            second: second.update,
        });
        if (xformResult.isError) {
            return xformResult;
        }
        return Result.ok({
            firstPrime:
                xformResult.value.firstPrime == null
                    ? undefined
                    : {
                          type: update,
                          update: xformResult.value.firstPrime,
                      },
            secondPrime:
                xformResult.value.secondPrime == null
                    ? undefined
                    : {
                          type: update,
                          update: xformResult.value.secondPrime,
                      },
        });
    }

    if (second.replace.newValue != null) {
        throw new Error('because first is update, second replace.newValue must not be undefined');
    }
    return Result.ok({
        secondPrime: second,
    });
};
