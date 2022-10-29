import {
    groupJoinMap,
    left,
    mapRecord,
    recordToArray,
    recordToMap,
    right,
} from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import * as t from 'io-ts';
import { Any } from 'io-ts';
import * as NullableTextOperation from '../nullableTextOperation';
import * as ParamRecordOperation from '../paramRecordOperation';
import { record as trecord } from '../record';
import { isIdRecord } from '../record';
import * as RecordOperation from '../recordOperation';
import {
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../recordOperationElement';
import * as TextOperation from '../textOperation';
import { Apply, ClientTransform, Compose, Diff, DownError, Restore } from '../util/type';

type ReadonlyRecord<TKey extends keyof any, TValue> = { readonly [P in TKey]: TValue };

export const $v = '$v';
export const $r = '$r';
export const atomic = 'atomic';
export const replace = 'replace';
export const ot = 'ot';
export const record = 'record';
export const paramRecord = 'paramRecord';
export const object = 'object';

const isKeyToIgnore = (key: string) => key === $v || key === $r;

const warnNotFoundTemplate = ({
    key,
    objectType,
}: {
    key: string;
    objectType: 'state' | 'operation';
}): void => {
    console.warn(
        `"${key}" key found at ${objectType} object, but template not found. Maybe you use keys which are not supported?`
    );
};

type If<T extends boolean, TTrue, TFalse> = T extends true
    ? TTrue
    : T extends false
    ? TFalse
    : TTrue | TFalse;

export type ReplaceValueTemplate<T extends Any> = {
    type: typeof atomic;
    mode: typeof replace;
    value: T;
};

/** Stateならば`T`に、TwoWayOperationならば`{ oldValue:T; newValue:T }`に変換されるtemplateを作成します。*/
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

/** Stateならば`string`(ただし`nullable === true`のときは代わりに`string | undefined`となます。`undefined`は`''`と同一として扱われます)に、TwoWayOperationならば変化のある部分のみを抽出したOperationに変換されるtemplateを作成します。*/
export const createTextValueTemplate = <T extends boolean>(nullable: T) =>
    ({
        type: atomic,
        mode: ot,
        nullable,
    } as const);

export type RecordValueTemplate<TValue extends AnyTemplate> = {
    type: typeof record;
    value: TValue;
};

/** `Record<string, T>`を表すtemplateを作成します。*/
export const createRecordValueTemplate = <TValue extends AnyTemplate>(value: TValue) => {
    return {
        type: record,
        value,
    } as const;
};

export type ParamRecordValueTemplate<TValue extends AnyTemplate> = {
    type: typeof paramRecord;
    value: TValue;
    defaultState: State<TValue>;
};

/** `Record<string, T>`を表すtemplateを作成します。存在しない要素はdefaultStateがセットされているとみなされます。 */
export const createParamRecordValueTemplate = <TValue extends AnyTemplate>(
    value: TValue,
    defaultState: State<TValue>
) => {
    return {
        type: paramRecord,
        value,
        defaultState,
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

/** 複数のtemplateから構成される新たなtemplateを作成します。 */
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
          type: typeof paramRecord;
          value: AnyTemplate;
          defaultState: any;
      }
    | {
          type: typeof object;
          $v: number | undefined;
          $r: number | undefined;
          value: { readonly [P in string]: AnyTemplate };
      };

type ParamRecordValueTemplateBase<TValue extends AnyTemplate> = {
    type: typeof paramRecord;
    value: TValue;
};

export type IoTsOptions = {
    exact: boolean;
};

/*
recordやparamRecordは変換なしで後方互換性を持たせられるように | undefined を付けている。
これらが undefined の場合は {} と等しいとみなす。いつでも undefined を {} に置き換えたり、その逆をしても良い。
例えば次のState { name: string } が存在していてこれにcharactersというRecordを追加する場面を考える。
もし | undefined を付けないと { name: string; characters: Record<string, Character> } となるが、{ name: 'NAME' } というJSONは { name: string; characters: Record<string, Character> } の型と合わないので { name: 'NAME': characters: {}} に変換する必要が出てきてしまう。いっぽう | undefined を付けると { name: string; characters: Record<string, Character> | undefined } となるため、{ name: 'NAME' } というJSONを変換なしで使える。
*/
export type State<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], string | undefined, string>
    : T extends ReplaceValueTemplate<infer U1>
    ? t.TypeOf<U1>
    : T extends RecordValueTemplate<infer U2>
    ? { [P in string]?: State<U2> | undefined } | undefined
    : T extends ParamRecordValueTemplateBase<infer U3>
    ? { [P in string]?: State<U3> | undefined } | undefined
    : T extends ObjectValueTemplate<infer U4, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & {
          [P in keyof U4]: State<U4[P]>;
      }
    : unknown;

export const state = <T extends AnyTemplate>(source: T, options: IoTsOptions): t.Type<State<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return source.value;
                case ot:
                    return source.nullable ? t.union([t.string, t.undefined]) : (t.string as any);
            }
            break;
        }
        case record:
        case paramRecord: {
            return t.union([trecord(t.string, state(source.value, options)), t.undefined]) as any;
        }
        case object: {
            const base = t.intersection([
                t.type({
                    $v: source.$v == null ? t.undefined : t.literal(source.$v),
                    $r: source.$r == null ? t.undefined : t.literal(source.$r),
                }),
                t.type(mapRecord(source.value, value => state(value, options))),
            ]) as any;
            if (options.exact) {
                return t.exact(base);
            }
            return base;
        }
    }
};

export type UpOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], NullableTextOperation.UpOperation, TextOperation.UpOperation>
    : T extends ReplaceValueTemplate<infer U1>
    ? { newValue: t.TypeOf<U1> }
    : T extends RecordValueTemplate<infer U2>
    ? {
          [P in string]?: RecordUpOperationElement<State<U2>, UpOperation<U2>> | undefined;
      }
    : T extends ParamRecordValueTemplate<infer U2>
    ? {
          [P in string]?: UpOperation<U2> | undefined;
      }
    : T extends ObjectValueTemplate<infer U3, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & { [P in keyof U3]?: UpOperation<U3[P]> }
    : unknown;

export const upOperation = <T extends AnyTemplate>(
    source: T,
    options: IoTsOptions
): t.Type<UpOperation<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return t.type({ newValue: source.value }) as any;
                case ot:
                    return source.nullable
                        ? NullableTextOperation.upOperation
                        : (TextOperation.upOperation as any);
            }
            break;
        }
        case record: {
            return trecord(
                t.string,
                recordUpOperationElementFactory(
                    state(source.value, options),
                    upOperation(source.value, options)
                )
            ) as any;
        }
        case paramRecord:
            return trecord(t.string, upOperation(source.value, options)) as any;
        case object: {
            const base = t.intersection([
                t.type({
                    $v: source.$v == null ? t.undefined : t.literal(source.$v),
                    $r: source.$r == null ? t.undefined : t.literal(source.$r),
                }),
                t.partial(mapRecord(source.value, value => upOperation(value, options))),
            ]) as any;
            if (options.exact) {
                return t.exact(base);
            }
            return base;
        }
    }
};

export type DownOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], NullableTextOperation.DownOperation, TextOperation.DownOperation>
    : T extends ReplaceValueTemplate<infer U1>
    ? { oldValue: t.TypeOf<U1> }
    : T extends RecordValueTemplate<infer U2>
    ? {
          [P in string]?: RecordDownOperationElement<State<U2>, DownOperation<U2>> | undefined;
      }
    : T extends ParamRecordValueTemplate<infer U2>
    ? {
          [P in string]?: DownOperation<U2> | undefined;
      }
    : T extends ObjectValueTemplate<infer U3, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & { [P in keyof U3]?: DownOperation<U3[P]> }
    : unknown;

export const downOperation = <T extends AnyTemplate>(
    source: T,
    options: IoTsOptions
): t.Type<DownOperation<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return t.type({ oldValue: source.value }) as any;
                case ot:
                    return source.nullable
                        ? NullableTextOperation.downOperation
                        : (TextOperation.downOperation as any);
            }
            break;
        }
        case record: {
            return trecord(
                t.string,
                recordDownOperationElementFactory(
                    state(source.value, options),
                    downOperation(source.value, options)
                )
            ) as any;
        }
        case paramRecord: {
            return trecord(t.string, downOperation(source.value, options)) as any;
        }
        case object: {
            const base = t.intersection([
                t.type({
                    $v: source.$v == null ? t.undefined : t.literal(source.$v),
                    $r: source.$r == null ? t.undefined : t.literal(source.$r),
                }),
                t.partial(mapRecord(source.value, value => downOperation(value, options))),
            ]) as any;
            if (options.exact) {
                return t.exact(base);
            }
            return base;
        }
    }
};

export type TwoWayOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], NullableTextOperation.TwoWayOperation, TextOperation.TwoWayOperation>
    : T extends ReplaceValueTemplate<infer U1>
    ? {
          oldValue: t.TypeOf<U1>;
          newValue: t.TypeOf<U1>;
      }
    : T extends RecordValueTemplate<infer U2>
    ? {
          [P in string]?: RecordTwoWayOperationElement<State<U2>, TwoWayOperation<U2>> | undefined;
      }
    : T extends ParamRecordValueTemplate<infer U2>
    ? {
          [P in string]?: TwoWayOperation<U2> | undefined;
      }
    : T extends ObjectValueTemplate<infer U4, infer UV, infer UR>
    ? {
          $v: UV;
          $r: UR;
      } & { [P in keyof U4]?: TwoWayOperation<U4[P]> }
    : unknown;

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
                    x => toUpOperation(template.value)(x)
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
                    }
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
                    x => toDownOperation(template.value)(x)
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
                    }
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
                    operation as Record<string, UpOperation<AnyTemplate>>
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
                    operation as Record<string, DownOperation<AnyTemplate>>
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
 * @param nextState - DownOperationが適用される前の状態のState。
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
                    downOperation as Record<string, DownOperation<AnyTemplate>>
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

/**
 * ユーザーの権限を考慮せずに、通常のOperational Transformを行います。主にクライアント側で使われます。破壊的な処理は行われません。
 *
 * この関数は次の2つの制約があります。
 * - `first`適用前のStateと`second`適用前のStateは等しい。
 * - このStateに対して`first`と`secondPrime`を順に適用したStateと、`second`と`firstPrime`を順に適用したStateは等しい。
 */
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
            case paramRecord: {
                return ParamRecordOperation.clientTransform({
                    first: first as Record<string, UpOperation<AnyTemplate> | undefined>,
                    second: second as Record<string, UpOperation<AnyTemplate> | undefined>,
                    innerTransform: ({ first, second }) =>
                        clientTransform(template.value)({
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
                            const templateElement = template.value[key];
                            if (templateElement == null) {
                                warnNotFoundTemplate({ key, objectType: 'operation' });
                                continue;
                            }
                            const xformed = clientTransform(templateElement)({
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
