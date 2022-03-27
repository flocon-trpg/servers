/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Result } from '@kizahasi/result';
import { Any } from 'io-ts';
import { Apply, ClientTransform, Compose, Diff, DownError, Restore } from '../util/type';
import * as t from 'io-ts';
import * as TextOperation from '../util/textOperation';
import * as NullableTextOperation from '../util/nullableTextOperation';
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
    toBeNever,
} from '@flocon-trpg/utils';
import { isIdRecord } from '../util/record';

type ReadonlyRecord<TKey extends keyof any, TValue> = { readonly [P in TKey]: TValue };

export const $v = '$v';
export const $r = '$r';
export const atomic = 'atomic';
export const replace = 'replace';
export const ot = 'ot';
export const record = 'record';
export const object = 'object';

const isKeyToIgnore = (key: string) => key === $v || key === $r;

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
    nullable: boolean;
    value?: undefined;
};

export const createOtValueTemplate = <T extends boolean>(nullable: T) =>
    ({
        type: atomic,
        mode: ot,
        nullable,
    } as const);

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

export type ObjectValueTemplate<
    T extends ReadonlyRecord<string, AnyTemplate>,
    V extends number | undefined,
    R extends number | undefined
> = {
    type: typeof object;
    $v: V;
    $r: R;
    value: {
        readonly [P in keyof T]: T[P];
    };
};

export const createObjectValueTemplate = <
    T extends ReadonlyRecord<string, AnyTemplate>,
    V extends number | undefined,
    R extends number | undefined
>(
    value: T,
    $v: V,
    $r: R
) => {
    return {
        type: object,
        $v,
        $r,
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
          $v: number | undefined;
          $r: number | undefined;
          value: { readonly [P in string]: AnyTemplate };
      };

export type State<T extends AnyTemplate> = T extends OtValueTemplate
    ? T['nullable'] extends false
        ? string
        : string | undefined
    : T extends ReplaceValueTemplate<infer U1>
    ? t.TypeOf<U1>
    : T extends RecordValueTemplate<infer U2>
    ? { readonly [P in string]?: State<U2> | undefined }
    : T extends ObjectValueTemplate<infer U3, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & {
          readonly [P in keyof U3]: State<U3[P]>;
      }
    : unknown;

export const state = <T extends AnyTemplate>(source: T): t.Type<State<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return source.value;
                case ot:
                    return source.nullable ? t.union([t.string, t.undefined]) : (t.string as any);
                default:
                    return toBeNever(source);
            }
        }
        case record: {
            return t.record(t.string, state(source.value)) as any;
        }
        case object: {
            return t.exact(
                t.intersection([
                    t.type({
                        $v: source.$v == null ? t.undefined : t.literal(source.$v),
                        $r: source.$r == null ? t.undefined : t.literal(source.$r),
                    }),
                    t.partial(mapRecord(source.value, value => state(value))),
                ])
            ) as any;
        }
        default:
            return toBeNever(source);
    }
};

export type UpOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? T['nullable'] extends true
        ? NullableTextOperation.UpOperation
        : T['nullable'] extends false
        ? TextOperation.UpOperation
        : NullableTextOperation.UpOperation | TextOperation.UpOperation
    : T extends ReplaceValueTemplate<infer U1>
    ? { newValue: t.TypeOf<U1> }
    : T extends RecordValueTemplate<infer U2>
    ? {
          readonly [P in string]?: RecordUpOperationElement<State<U2>, UpOperation<U2>> | undefined;
      }
    : T extends ObjectValueTemplate<infer U3, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & { readonly [P in keyof U3]?: UpOperation<U3[P]> }
    : unknown;

export const upOperation = <T extends AnyTemplate>(source: T): t.Type<UpOperation<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return t.type({ newValue: source.value }) as any;
                case ot:
                    return source.nullable
                        ? NullableTextOperation.upOperation
                        : (TextOperation.upOperation as any);
                default:
                    return toBeNever(source);
            }
        }
        case record: {
            return t.record(t.string, upOperation(source.value)) as any;
        }
        case object: {
            return t.exact(
                t.intersection([
                    t.type({
                        $v: source.$v == null ? t.undefined : t.literal(source.$v),
                        $r: source.$r == null ? t.undefined : t.literal(source.$r),
                    }),
                    t.partial(mapRecord(source.value, value => upOperation(value))),
                ])
            ) as any;
        }
        default:
            return toBeNever(source);
    }
};

export type DownOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? T['nullable'] extends true
        ? NullableTextOperation.DownOperation
        : T['nullable'] extends false
        ? TextOperation.DownOperation
        : NullableTextOperation.DownOperation | TextOperation.DownOperation
    : T extends ReplaceValueTemplate<infer U1>
    ? { oldValue: t.TypeOf<U1> }
    : T extends RecordValueTemplate<infer U2>
    ? {
          readonly [P in string]?:
              | RecordDownOperationElement<State<U2>, DownOperation<U2>>
              | undefined;
      }
    : T extends ObjectValueTemplate<infer U3, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & { readonly [P in keyof U3]?: DownOperation<U3[P]> }
    : unknown;

export const downOperation = <T extends AnyTemplate>(source: T): t.Type<DownOperation<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return t.type({ oldValue: source.value }) as any;
                case ot:
                    return source.nullable
                        ? NullableTextOperation.downOperation
                        : (TextOperation.downOperation as any);
                default:
                    return toBeNever(source);
            }
        }
        case record: {
            return t.record(t.string, downOperation(source.value)) as any;
        }
        case object: {
            return t.exact(
                t.intersection([
                    t.type({
                        $v: source.$v == null ? t.undefined : t.literal(source.$v),
                        $r: source.$r == null ? t.undefined : t.literal(source.$r),
                    }),
                    t.partial(mapRecord(source.value, value => downOperation(value))),
                ])
            ) as any;
        }
        default:
            return toBeNever(source);
    }
};

export type TwoWayOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? T['nullable'] extends true
        ? NullableTextOperation.TwoWayOperation
        : T['nullable'] extends false
        ? TextOperation.TwoWayOperation
        : NullableTextOperation.TwoWayOperation | TextOperation.TwoWayOperation
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
    : T extends ObjectValueTemplate<infer U4, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & { readonly [P in keyof U4]?: TwoWayOperation<U4[P]> }
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
                        UpOperation<AnyTemplate>
                    >,
                    mapState: x => x,
                    mapOperation: operation => toUpOperation(template.value)(operation as any),
                }) as any;
            }
            case object: {
                return mapRecord(
                    twoWayOperation as Record<string, TwoWayOperation<AnyTemplate>>,
                    (operationElement, key) =>
                        isKeyToIgnore(key)
                            ? operationElement
                            : toUpOperation(template.value[key]!)(operationElement)
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
                        isKeyToIgnore(key)
                            ? operationElement
                            : toDownOperation(template.value[key]!)(operationElement)
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
                        return template.nullable
                            ? NullableTextOperation.apply(state, operationAsAny)
                            : TextOperation.apply(state, operationAsAny);
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
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
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
                        return template.nullable
                            ? NullableTextOperation.applyBack(state, operationAsAny)
                            : TextOperation.applyBack(state, operationAsAny);
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
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
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
                const twoWayOperation: Record<string, TwoWayOperation<T> | number | undefined> = {
                    [$v]: template.$v,
                    [$r]: template.$r,
                };
                for (const { key, value } of recordToArray(
                    downOperation as Record<string, DownOperation<AnyTemplate>>
                )) {
                    if (isKeyToIgnore(key)) {
                        continue;
                    }
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
                    prevState: prevState as Record<string, State<AnyTemplate>>,
                    nextState: nextState as Record<string, State<AnyTemplate>>,
                    innerDiff: ({ prevState, nextState }) =>
                        diff(template.value)({ prevState, nextState }),
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
