/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    groupJoinMap,
    left,
    loggerRef,
    mapRecord,
    recordToArray,
    recordToMap,
    right,
} from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import * as ArrayOperation from '../array';
import { $index } from '../array';
import * as NullableTextOperation from '../nullableTextOperation';
import * as ParamRecordOperation from '../paramRecordOperation';
import { isIdRecord } from '../record';
import * as RecordOperation from '../recordOperation';
import * as TextOperation from '../textOperation';
import { Apply, ClientTransform, Compose, Diff, DownError, Restore, UpError } from '../util/type';
import {
    AnyTemplate,
    DownOperation,
    State,
    TwoWayOperation,
    UpOperation,
    atomic,
    object,
    ot,
    paramRecord,
    record,
    replace,
} from './types';

export const $v = '$v';
export const $r = '$r';

const isKeyToIgnore = (key: string) => key === $v || key === $r;

const warnNotFoundTemplate = ({
    key,
    objectType,
}: {
    key: string;
    objectType: 'state' | 'operation';
}): void => {
    loggerRef.warn(
        `"${key}" key was found at ${objectType} object, but template not found. It seems that the template is invalid or the ${objectType} object has keys which are not in the template.`,
    );
};

/** TwoWayOperationをUpOperationに変換します。 */
export const toUpOperation =
    <T extends AnyTemplate>(template: T) =>
    (twoWayOperation: TwoWayOperation<T>): UpOperation<T> => {
        const twoWayOperationAsAny = twoWayOperation as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return {
                            newValue: twoWayOperationAsAny.newValue,
                        } as any;
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.toUpOperation(twoWayOperationAsAny)
                            : (TextOperation.toUpOperation(twoWayOperationAsAny) as any);
                }
                break;
            }
            case record: {
                return RecordOperation.mapRecordUpOperation({
                    source: twoWayOperation as RecordOperation.RecordTwoWayOperation<
                        State<AnyTemplate>,
                        TwoWayOperation<AnyTemplate>
                    >,
                    mapState: x => x,
                    mapOperation: operation => toUpOperation(template.value)(operation as any),
                }) as any;
            }
            case paramRecord: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate> | undefined>,
                    x => toUpOperation(template.value)(x),
                ) as any;
            }
            case object: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate>>,
                    (operationElement, key) => {
                        if (isKeyToIgnore(key)) {
                            return operationElement;
                        }
                        const templateElement = template.value[key];
                        if (templateElement == null) {
                            warnNotFoundTemplate({ key, objectType: 'operation' });
                            return undefined;
                        }
                        return toUpOperation(templateElement)(operationElement);
                    },
                ) as any;
            }
        }
    };

/** TwoWayOperationをDownOperationに変換します。 */
export const toDownOperation =
    <T extends AnyTemplate>(template: T) =>
    (twoWayOperation: TwoWayOperation<T>): DownOperation<T> => {
        const twoWayOperationAsAny = twoWayOperation as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return {
                            oldValue: twoWayOperationAsAny.oldValue,
                        } as any;
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.toDownOperation(twoWayOperationAsAny)
                            : (TextOperation.toDownOperation(twoWayOperationAsAny) as any);
                }
                break;
            }
            case record: {
                return RecordOperation.mapRecordDownOperation({
                    source: twoWayOperation as RecordOperation.RecordTwoWayOperation<
                        State<AnyTemplate>,
                        TwoWayOperation<AnyTemplate>
                    >,
                    mapState: x => x,
                    mapOperation: operation => toDownOperation(template.value)(operation as any),
                }) as any;
            }
            case paramRecord: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate> | undefined>,
                    x => toDownOperation(template.value)(x),
                ) as any;
            }
            case object: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate>>,
                    (operationElement, key) => {
                        if (isKeyToIgnore(key)) {
                            return operationElement;
                        }
                        const templateElement = template.value[key];
                        if (templateElement == null) {
                            warnNotFoundTemplate({ key, objectType: 'operation' });
                            return undefined;
                        }
                        return toDownOperation(templateElement)(operationElement);
                    },
                ) as any;
            }
        }
    };

/** StateにUpOperationを適用します。破壊的な処理は行われません。 */
export const apply =
    <T extends AnyTemplate>(template: T): Apply<State<T>, UpOperation<T>> =>
    ({ state, operation }) => {
        const operationAsAny = operation as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return Result.ok(operationAsAny.newValue);
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.apply(state, operationAsAny)
                            : TextOperation.apply(state, operationAsAny);
                }
                break;
            }
            case record: {
                return RecordOperation.apply({
                    prevState: (state ?? {}) as Record<string, State<AnyTemplate>>,
                    operation: operation as RecordOperation.RecordUpOperation<
                        State<AnyTemplate>,
                        UpOperation<AnyTemplate>
                    >,
                    innerApply: ({ prevState, operation }) =>
                        apply(template.value)({
                            state: prevState,
                            operation: operation as any,
                        }),
                });
            }
            case paramRecord: {
                return ParamRecordOperation.apply({
                    prevState: state ?? {},
                    operation: operation as Record<string, UpOperation<AnyTemplate>>,
                    innerApply: ({ prevState, operation }) =>
                        apply(template.value)({
                            state: prevState,
                            operation: operation,
                        }),
                    defaultState: template.defaultState,
                });
            }
            case object: {
                const result = { ...state };
                for (const { key, value } of recordToArray(
                    operation as Record<string, UpOperation<AnyTemplate>>,
                )) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
                    const templateElement = template.value[key];
                    if (templateElement == null) {
                        warnNotFoundTemplate({ key, objectType: 'operation' });
                        continue;
                    }
                    const applied = apply(templateElement)({
                        state: state[key],
                        operation: value,
                    });
                    if (applied.isError) {
                        return applied;
                    }
                    result[key] = applied.value;
                }
                return Result.ok(result);
            }
        }
    };

/** StateにDownOperationを適用します。破壊的な処理は行われません。 */
export const applyBack =
    <T extends AnyTemplate>(template: T): Apply<State<T>, DownOperation<T>> =>
    ({ state, operation }) => {
        const operationAsAny = operation as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return Result.ok(operationAsAny.oldValue);
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.applyBack(state, operationAsAny)
                            : TextOperation.applyBack(state, operationAsAny);
                }
                break;
            }
            case record: {
                return RecordOperation.applyBack({
                    nextState: (state ?? {}) as Record<string, State<AnyTemplate>>,
                    operation: operation as RecordOperation.RecordDownOperation<
                        State<AnyTemplate>,
                        DownOperation<AnyTemplate>
                    >,
                    innerApplyBack: ({ state, operation }) =>
                        applyBack(template.value)({
                            state,
                            operation: operation as any,
                        }),
                });
            }
            case paramRecord: {
                return ParamRecordOperation.applyBack({
                    nextState: state ?? {},
                    operation: operation as Record<string, DownOperation<AnyTemplate>>,
                    innerApplyBack: ({ nextState, operation }) =>
                        applyBack(template.value)({
                            state: nextState,
                            operation: operation,
                        }),
                    defaultState: template.defaultState,
                });
            }
            case object: {
                const result = { ...state };
                for (const { key, value } of recordToArray(
                    operation as Record<string, DownOperation<AnyTemplate>>,
                )) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
                    const templateElement = template.value[key];
                    if (templateElement == null) {
                        warnNotFoundTemplate({ key, objectType: 'operation' });
                        continue;
                    }
                    const applied = applyBack(templateElement)({
                        state: state[key],
                        operation: value,
                    });
                    if (applied.isError) {
                        return applied;
                    }
                    result[key] = applied.value;
                }
                return Result.ok(result);
            }
        }
    };

/** 連続する2つのDownOperationを合成します。破壊的な処理は行われません。 */
export const composeDownOperation =
    <T extends AnyTemplate>(template: T): Compose<DownOperation<T>, DownError> =>
    ({ first, second }) => {
        const firstAsAny = first as any;
        const secondAsAny = second as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return Result.ok({
                            oldValue: firstAsAny.oldValue,
                        } as any);
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.composeDownOperation(firstAsAny, secondAsAny)
                            : TextOperation.composeDownOperation(firstAsAny, secondAsAny);
                }
                break;
            }
            case record: {
                return RecordOperation.composeDownOperation({
                    first: first as RecordOperation.RecordDownOperation<
                        State<AnyTemplate>,
                        DownOperation<AnyTemplate>
                    >,
                    second: second as RecordOperation.RecordDownOperation<
                        State<AnyTemplate>,
                        DownOperation<AnyTemplate>
                    >,
                    innerApplyBack: ({ state, operation }) =>
                        applyBack(template.value)({ state, operation }),
                    innerCompose: ({ first, second }) =>
                        composeDownOperation(template.value)({ first, second }),
                });
            }
            case paramRecord: {
                return ParamRecordOperation.compose({
                    first,
                    second,
                    innerCompose: ({ first, second }) =>
                        composeDownOperation(template.value)({ first, second }),
                });
            }
            case object: {
                const firstMap = recordToMap(first);
                const secondMap = recordToMap(second);
                const result: Record<string, DownOperation<AnyTemplate> | number | undefined> = {
                    [$v]: template.$v,
                    [$r]: template.$r,
                };
                for (const [key, value] of groupJoinMap(firstMap, secondMap)) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
                    switch (value.type) {
                        case left:
                            result[key] = value.left;
                            break;
                        case right:
                            result[key] = value.right;
                            break;
                        default: {
                            const templateElement = template.value[key];
                            if (templateElement == null) {
                                warnNotFoundTemplate({ key, objectType: 'operation' });
                                continue;
                            }
                            const composed = composeDownOperation(templateElement)({
                                first: value.left,
                                second: value.right,
                            });
                            if (composed.isError) {
                                return composed;
                            }
                            result[key] = composed.value;
                        }
                    }
                }
                return Result.ok(result);
            }
        }
    };

/**
 * Stateの情報を用いて、DownOperationをTwoWayOperationに変換します。破壊的な処理は行われません。
 * @param nextState DownOperationが適用される前の状態のState。
 */
export const restore =
    <T extends AnyTemplate>(template: T): Restore<State<T>, DownOperation<T>, TwoWayOperation<T>> =>
    ({ nextState, downOperation }) => {
        const nextStateAsAny = nextState as any;
        const downOperationAsAny = downOperation as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return Result.ok({
                            prevState: downOperationAsAny.oldValue,
                            twoWayOperation: {
                                oldValue: downOperationAsAny.oldValue,
                                newValue: nextState,
                            } as any,
                        });
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.restore({
                                  nextState: nextStateAsAny,
                                  downOperation: downOperationAsAny,
                              })
                            : TextOperation.restore({
                                  nextState: nextStateAsAny,
                                  downOperation: downOperationAsAny,
                              });
                }
                break;
            }
            case record: {
                return RecordOperation.restore({
                    nextState: (nextState ?? {}) as Record<string, State<AnyTemplate>>,
                    downOperation: downOperation as RecordOperation.RecordDownOperation<
                        State<AnyTemplate>,
                        DownOperation<AnyTemplate>
                    >,
                    innerDiff: ({ prevState, nextState }) =>
                        diff(template.value)({ prevState, nextState }),
                    innerRestore: ({ downOperation, nextState }) =>
                        restore(template.value)({ downOperation: downOperation as any, nextState }),
                });
            }
            case paramRecord: {
                return ParamRecordOperation.restore({
                    nextState: nextState ?? {},
                    downOperation: downOperation as Record<
                        string,
                        DownOperation<AnyTemplate> | undefined
                    >,
                    innerRestore: ({ downOperation, nextState }) =>
                        restore(template.value)({ downOperation: downOperation as any, nextState }),
                });
            }
            case object: {
                const prevState = { ...nextState };
                const twoWayOperation: Record<string, TwoWayOperation<T> | number | undefined> = {
                    [$v]: template.$v,
                    [$r]: template.$r,
                };
                for (const { key, value } of recordToArray(
                    downOperation as Record<string, DownOperation<AnyTemplate>>,
                )) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
                    const templateElement = template.value[key];
                    if (templateElement == null) {
                        warnNotFoundTemplate({ key, objectType: 'operation' });
                        continue;
                    }
                    const restored = restore(templateElement)({
                        nextState: nextState[key],
                        downOperation: value,
                    });
                    if (restored.isError) {
                        return restored;
                    }
                    prevState[key] = restored.value.prevState;
                    twoWayOperation[key] = restored.value.twoWayOperation as
                        | TwoWayOperation<T>
                        | undefined;
                }
                return Result.ok({ prevState, twoWayOperation });
            }
        }
    };

/** 2つのStateオブジェクトの差分を取ります。
 * @returns 2つのオブジェクトが意味上で同一であればundefinedを返します。
 */
export const diff =
    <T extends AnyTemplate>(template: T): Diff<State<T>, TwoWayOperation<T>> =>
    ({ prevState, nextState }) => {
        const prevStateAsAny = prevState as any;
        const nextStateAsAny = nextState as any;
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return prevState === nextState
                            ? undefined
                            : ({
                                  oldValue: prevState,
                                  newValue: nextState,
                              } as any);
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.diff({
                                  prev: prevStateAsAny,
                                  next: nextStateAsAny,
                              })
                            : TextOperation.diff({ prev: prevStateAsAny, next: nextStateAsAny });
                }
                break;
            }
            case record: {
                return RecordOperation.diff({
                    prevState: (prevState ?? {}) as Record<string, State<AnyTemplate>>,
                    nextState: (nextState ?? {}) as Record<string, State<AnyTemplate>>,
                    innerDiff: ({ prevState, nextState }) =>
                        diff(template.value)({ prevState, nextState }),
                });
            }
            case paramRecord: {
                return ParamRecordOperation.diff({
                    prevState: (prevState ?? {}) as Record<string, State<AnyTemplate>>,
                    nextState: (nextState ?? {}) as Record<string, State<AnyTemplate>>,
                    innerDiff: ({ prevState, nextState }) =>
                        diff(template.value)({
                            prevState: prevState ?? template.defaultState,
                            nextState: nextState ?? template.defaultState,
                        }),
                });
            }
            case object: {
                const prevStateMap = recordToMap(prevState);
                const nextStateMap = recordToMap(nextState);
                const result: Record<string, TwoWayOperation<AnyTemplate> | number | undefined> = {
                    [$v]: template.$v,
                    [$r]: template.$r,
                };
                for (const [key, value] of groupJoinMap(prevStateMap, nextStateMap)) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
                    const templateElement = template.value[key];
                    if (templateElement == null) {
                        warnNotFoundTemplate({ key, objectType: 'state' });
                        continue;
                    }
                    result[key] = diff(templateElement)({
                        prevState: value.left,
                        nextState: value.right,
                    });
                }
                if (isIdRecord(result)) {
                    return undefined;
                }
                return result;
            }
        }
    };

const requiresArrayTransformation = <TState, TOperation>(
    operations: (RecordOperation.RecordUpOperation<TState, TOperation> | null | undefined)[],
): boolean => {
    for (const operation of operations) {
        if (operation == null) {
            continue;
        }
        for (const operationElement of recordToArray(operation)) {
            if (operationElement.value.type === replace) {
                const newValue = operationElement.value.replace.newValue;
                if (
                    typeof newValue === 'object' &&
                    newValue != null &&
                    $index in newValue &&
                    newValue[$index] !== undefined
                ) {
                    return true;
                }
                continue;
            }

            const update = operationElement.value.update;
            if (
                typeof update === 'object' &&
                update != null &&
                $index in update &&
                update[$index] !== undefined
            ) {
                return true;
            }
        }
    }

    return false;
};

/**
 * ユーザーの権限を考慮せずに、通常のOperational Transformを行います。主にクライアント側で使われます。破壊的な処理は行われません。
 *
 * この関数は次の2つの制約があります。
 * - `first`適用前のStateと`second`適用前のStateは等しい。
 * - このStateに対して`first`と`secondPrime`を順に適用したStateと、`second`と`firstPrime`を順に適用したStateは等しい。
 *
 * Record の template の場合、state や operation に `$index` というキーのプロパティがある場合はIndexObject(配列の要素)であるとみなされ、`$index`を調整する operation が自動的に追加されることがあります。そのため、配列の要素とみなしたい場合を除いて`$index`というキーをオブジェクトに含めないようにしてください。
 */
export const clientTransform =
    <T extends AnyTemplate>(template: T): ClientTransform<State<T>, UpOperation<T>> =>
    ({ state, first, second }) => {
        switch (template.type) {
            case atomic: {
                switch (template.mode) {
                    case replace:
                        return Result.ok({
                            firstPrime: {
                                newValue: (first as any).newValue,
                            },
                            secondPrime: undefined,
                        }) as any;
                    case ot:
                        return template.nullable
                            ? NullableTextOperation.clientTransform({
                                  first: first as any,
                                  second: second as any,
                              })
                            : TextOperation.clientTransform({
                                  first: first as any,
                                  second: second as any,
                              });
                }
                break;
            }
            case record: {
                const $first = first as RecordOperation.RecordUpOperation<
                    State<AnyTemplate>,
                    UpOperation<AnyTemplate>
                >;
                const $second = second as RecordOperation.RecordUpOperation<
                    State<AnyTemplate>,
                    UpOperation<AnyTemplate>
                >;
                const args: Parameters<
                    typeof RecordOperation.clientTransform<any, any, UpError>
                >[0] = {
                    state,
                    first: $first,
                    second: $second,
                    innerTransform: ({ state, first, second }) =>
                        clientTransform(template.value)({
                            state,
                            first,
                            second,
                        }),
                    innerDiff: ({ prevState, nextState }) => {
                        const d = diff(template.value)({ prevState, nextState });
                        if (d == null) {
                            return undefined;
                        }
                        return toUpOperation(template.value)(d);
                    },
                };
                if (requiresArrayTransformation([$first, $second])) {
                    return ArrayOperation.clientTransform({
                        ...args,
                        innerApply: ({ prevState, operation }) =>
                            apply(template.value)({ state: prevState, operation }),
                    });
                }
                return RecordOperation.clientTransform(args);
            }
            case paramRecord: {
                return ParamRecordOperation.clientTransform({
                    state,
                    defaultState: template.defaultState,
                    first: first as Record<string, UpOperation<AnyTemplate> | undefined>,
                    second: second as Record<string, UpOperation<AnyTemplate> | undefined>,
                    innerTransform: ({ state, first, second }) =>
                        clientTransform(template.value)({
                            state,
                            first,
                            second,
                        }),
                });
            }
            case object: {
                const firstMap = recordToMap(first);
                const secondMap = recordToMap(second);
                const firstPrime: Record<string, UpOperation<AnyTemplate> | number | undefined> = {
                    [$v]: template.$v,
                    [$r]: template.$r,
                };
                const secondPrime: Record<string, UpOperation<AnyTemplate> | number | undefined> = {
                    [$v]: template.$v,
                    [$r]: template.$r,
                };
                for (const [key, value] of groupJoinMap(firstMap, secondMap)) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
                    switch (value.type) {
                        case left:
                            firstPrime[key] = value.left;
                            break;
                        case right:
                            secondPrime[key] = value.right;
                            break;
                        default: {
                            const s = state[key];
                            if (s === undefined) {
                                return Result.error(
                                    `${key} is not found at object client transform.`,
                                );
                            }
                            const templateElement = template.value[key];
                            if (templateElement == null) {
                                warnNotFoundTemplate({ key, objectType: 'operation' });
                                continue;
                            }
                            const xformed = clientTransform(templateElement)({
                                state: s,
                                first: value.left,
                                second: value.right,
                            });
                            if (xformed.isError) {
                                return xformed;
                            }
                            firstPrime[key] = xformed.value.firstPrime;
                            secondPrime[key] = xformed.value.secondPrime;
                        }
                    }
                }
                return Result.ok({
                    firstPrime: isIdRecord(firstPrime) ? undefined : firstPrime,
                    secondPrime: isIdRecord(secondPrime) ? undefined : secondPrime,
                });
            }
        }
    };
