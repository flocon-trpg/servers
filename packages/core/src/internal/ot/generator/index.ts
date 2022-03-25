/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Result } from '@kizahasi/result';
import { Any } from 'io-ts';
import { Apply, ClientTransform, Compose, Diff, DownError, Restore } from '../util/type';
import * as t from 'io-ts';
import * as TextOperation from '../util/textOperation';
import * as RecordOperation from '../util/recordOperation';
import {
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
} from '../util/recordOperationElement';
import {
    groupJoinMap,
    left,
    mapRecord,
    recordToArray,
    recordToMap,
    right,
} from '@flocon-trpg/utils';
import { isIdRecord } from '../util/record';

type ReadonlyRecord<TKey extends keyof any, TValue> = { readonly [P in TKey]: TValue };

export const atomic = 'atomic';
export const replace = 'replace';
export const ot = 'ot';
export const record = 'record';
export const object = 'object';

export type ReplaceValueTemplate<T extends Any> = {
    type: typeof atomic;
    mode: typeof replace;
    value: T;
};

export const createReplaceValueTemplate = <T extends Any>(value: T) => {
    return {
        type: atomic,
        mode: replace,
        value,
    } as const;
};

export type OtValueTemplate = {
    type: typeof atomic;
    mode: typeof ot;
    value?: undefined;
};

export const otValueTemplate = {
    type: atomic,
    mode: ot,
} as const;

export type RecordValueTemplate<T extends AnyTemplate> = {
    type: typeof record;
    value: T;
};

export const createRecordValueTemplate = <T extends AnyTemplate>(value: T) => {
    return {
        type: record,
        value,
    } as const;
};

export type ObjectValueTemplate<T extends ReadonlyRecord<string, AnyTemplate>> = {
    type: typeof object;
    value: {
        readonly [P in keyof T]: T[P];
    };
};

export const createObjectValueTemplate = <T extends ReadonlyRecord<string, AnyTemplate>>(
    value: T
) => {
    return {
        type: object,
        value,
    } as const;
};

type AnyTemplate =
    | ReplaceValueTemplate<Any>
    | OtValueTemplate
    | {
          type: typeof record;
          value: AnyTemplate;
      }
    | {
          type: typeof object;
          value: { readonly [P in string]: AnyTemplate };
      };

export type State<T extends AnyTemplate> = T extends OtValueTemplate
    ? string
    : T extends ReplaceValueTemplate<infer U1>
    ? t.TypeOf<U1>
    : T extends RecordValueTemplate<infer U2>
    ? { readonly [P in string]?: State<U2> | undefined }
    : T extends ObjectValueTemplate<infer U3>
    ? { readonly [P in keyof U3]: State<U3[P]> }
    : unknown;

export type UpOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? TextOperation.UpOperation
    : T extends ReplaceValueTemplate<infer U1>
    ? { newValue: t.TypeOf<U1> }
    : T extends RecordValueTemplate<infer U2>
    ? {
          readonly [P in string]?: RecordUpOperationElement<State<U2>, UpOperation<U2>> | undefined;
      }
    : T extends ObjectValueTemplate<infer U3>
    ? { readonly [P in keyof U3]?: UpOperation<U3[P]> }
    : unknown;

export type DownOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? TextOperation.DownOperation
    : T extends ReplaceValueTemplate<infer U1>
    ? { oldValue: t.TypeOf<U1> }
    : T extends RecordValueTemplate<infer U2>
    ? {
          readonly [P in string]?:
              | RecordDownOperationElement<State<U2>, DownOperation<U2>>
              | undefined;
      }
    : T extends ObjectValueTemplate<infer U3>
    ? { readonly [P in keyof U3]?: DownOperation<U3[P]> }
    : unknown;

export type TwoWayOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? TextOperation.TwoWayOperation
    : T extends ReplaceValueTemplate<infer U1>
    ? {
          oldValue: t.TypeOf<U1>;
          newValue: t.TypeOf<U1>;
      }
    : T extends RecordValueTemplate<infer U2>
    ? {
          readonly [P in string]?:
              | RecordTwoWayOperationElement<State<U2>, TwoWayOperation<U2>>
              | undefined;
      }
    : T extends ObjectValueTemplate<infer U4>
    ? { readonly [P in keyof U4]?: TwoWayOperation<U4[P]> }
    : unknown;

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
                        return TextOperation.toUpOperation(twoWayOperationAsAny) as any;
                }
                break;
            }
            case record: {
                return RecordOperation.mapRecordUpOperation({
                    source: twoWayOperation as RecordOperation.RecordTwoWayOperation<
                        State<AnyTemplate>,
                        UpOperation<AnyTemplate>
                    >,
                    mapState: x => x,
                    mapOperation: operation => toUpOperation(template.value)(operation as any),
                }) as any;
            }
            case object: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate>>,
                    (operationElement, key) => toUpOperation(template.value[key]!)(operationElement)
                ) as any;
            }
        }
    };

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
                        return TextOperation.toDownOperation(twoWayOperationAsAny) as any;
                }
                break;
            }
            case record: {
                return RecordOperation.mapRecordDownOperation({
                    source: twoWayOperation as RecordOperation.RecordTwoWayOperation<
                        State<AnyTemplate>,
                        DownOperation<AnyTemplate>
                    >,
                    mapState: x => x,
                    mapOperation: operation => toDownOperation(template.value)(operation as any),
                }) as any;
            }
            case object: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate>>,
                    (operationElement, key) =>
                        toDownOperation(template.value[key]!)(operationElement)
                ) as any;
            }
        }
    };

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
                        return TextOperation.apply(state, operationAsAny);
                }
                break;
            }
            case record: {
                return RecordOperation.apply({
                    prevState: state as Record<string, State<AnyTemplate>>,
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
            case object: {
                const result = { ...state };
                for (const { key, value } of recordToArray(
                    operation as Record<string, UpOperation<AnyTemplate>>
                )) {
                    const applied = apply(template.value[key]!)({
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
                        return TextOperation.applyBack(state, operationAsAny);
                }
                break;
            }
            case record: {
                return RecordOperation.applyBack({
                    nextState: state as Record<string, State<AnyTemplate>>,
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
            case object: {
                const result = { ...state };
                for (const { key, value } of recordToArray(
                    operation as Record<string, DownOperation<AnyTemplate>>
                )) {
                    const applied = applyBack(template.value[key]!)({
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
                        return TextOperation.composeDownOperation(firstAsAny, secondAsAny);
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
            case object: {
                const firstMap = recordToMap(first);
                const secondMap = recordToMap(second);
                const result: Record<string, DownOperation<AnyTemplate> | undefined> = {};
                for (const [key, value] of groupJoinMap(firstMap, secondMap)) {
                    switch (value.type) {
                        case left:
                            result[key] = value.left;
                            break;
                        case right:
                            result[key] = value.right;
                            break;
                        default: {
                            const composed = composeDownOperation(template.value[key]!)({
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
                        return TextOperation.restore({
                            nextState: nextStateAsAny,
                            downOperation: downOperationAsAny,
                        });
                }
                break;
            }
            case record: {
                return RecordOperation.restore({
                    nextState: nextState as Record<string, State<AnyTemplate>>,
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
            case object: {
                const prevState = { ...nextState };
                const twoWayOperation: Record<string, TwoWayOperation<T> | undefined> = {};
                for (const { key, value } of recordToArray(
                    downOperation as Record<string, DownOperation<AnyTemplate>>
                )) {
                    const restored = restore(template.value[key]!)({
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
                        return TextOperation.diff({ prev: prevStateAsAny, next: nextStateAsAny });
                }
                break;
            }
            case record: {
                return RecordOperation.diff({
                    prevState: prevState as Record<string, State<AnyTemplate>>,
                    nextState: nextState as Record<string, State<AnyTemplate>>,
                    innerDiff: ({ prevState, nextState }) =>
                        diff(template.value)({ prevState, nextState }),
                });
            }
            case object: {
                const prevStateMap = recordToMap(prevState);
                const nextStateMap = recordToMap(nextState);
                const result: Record<string, TwoWayOperation<AnyTemplate> | undefined> = {};
                for (const [key, value] of groupJoinMap(prevStateMap, nextStateMap)) {
                    result[key] = diff(template.value[key]!)({
                        prevState: value.left,
                        nextState: value.right,
                    });
                }
                return result;
            }
        }
    };

export const clientTransform =
    <T extends AnyTemplate>(template: T): ClientTransform<UpOperation<T>> =>
    ({ first, second }) => {
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
                        return TextOperation.clientTransform({
                            first: first as any,
                            second: second as any,
                        });
                }
                break;
            }
            case record: {
                return RecordOperation.clientTransform({
                    first: first as RecordOperation.RecordUpOperation<
                        State<AnyTemplate>,
                        UpOperation<AnyTemplate>
                    >,
                    second: second as RecordOperation.RecordUpOperation<
                        State<AnyTemplate>,
                        UpOperation<AnyTemplate>
                    >,
                    innerTransform: ({ first, second }) =>
                        clientTransform(template.value)({
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
                });
            }
            case object: {
                const firstMap = recordToMap(first);
                const secondMap = recordToMap(second);
                const firstPrime: Record<string, UpOperation<AnyTemplate> | undefined> = {};
                const secondPrime: Record<string, UpOperation<AnyTemplate> | undefined> = {};
                for (const [key, value] of groupJoinMap(firstMap, secondMap)) {
                    switch (value.type) {
                        case left:
                            firstPrime[key] = value.left;
                            break;
                        case right:
                            secondPrime[key] = value.right;
                            break;
                        default: {
                            const xformed = clientTransform(template.value[key]!)({
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
