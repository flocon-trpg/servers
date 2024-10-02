import { mapRecord } from '@flocon-trpg/utils';
import { z } from 'zod';
import * as NullableTextOperation from '../nullableTextOperation';
import { record as zrecord } from '../record';
import {
    RecordDownOperationElement,
    RecordTwoWayOperationElement,
    RecordUpOperationElement,
    recordDownOperationElementFactory,
    recordUpOperationElementFactory,
} from '../recordOperationElement';

import * as TextOperation from '../textOperation';

type ReadonlyRecord<TKey extends keyof any, TValue> = { readonly [P in TKey]: TValue };

export const atomic = 'atomic';
export const replace = 'replace';
export const ot = 'ot';
export const record = 'record';
export const paramRecord = 'paramRecord';
export const object = 'object';

export type ReplaceValueTemplate<T extends z.ZodTypeAny> = {
    type: typeof atomic;
    mode: typeof replace;
    value: T;
};

/** Stateならば`T`に、TwoWayOperationならば`{ oldValue:T; newValue:T }`に変換されるtemplateを作成します。*/
export const createReplaceValueTemplate = <T extends z.ZodTypeAny>(value: T) => {
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
    }) as const;

export type RecordValueTemplate<TValue extends AnyTemplate> = {
    type: typeof record;
    value: TValue;
};

/** `Record<string, T>`を表すtemplateを作成します。*/
export const createRecordValueTemplate = <TValue extends AnyTemplate>(
    value: TValue,
): RecordValueTemplate<TValue> => {
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
    defaultState: State<TValue>,
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
    R extends number | undefined,
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
    R extends number | undefined,
>(
    value: T,
    $v: V,
    $r: R,
) => {
    return {
        type: object,
        $v,
        $r,
        value,
    } as const;
};

export type AnyTemplate =
    | ReplaceValueTemplate<z.ZodTypeAny>
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

type If<T extends boolean, TTrue, TFalse> = T extends true
    ? TTrue
    : T extends false
      ? TFalse
      : TTrue | TFalse;

type ParamRecordValueTemplateBase<TValue extends AnyTemplate> = {
    type: typeof paramRecord;
    value: TValue;
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
      ? z.TypeOf<U1>
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

export const state = <T extends AnyTemplate>(source: T): z.ZodType<State<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return source.value;
                case ot:
                    return source.nullable
                        ? z.union([z.string(), z.undefined()])
                        : (z.string() as any);
            }
            break;
        }
        case record:
        case paramRecord: {
            return z.union([zrecord(state(source.value)), z.undefined()]) as any;
        }
        case object: {
            return z
                .object({
                    $v: source.$v == null ? z.undefined() : z.literal(source.$v),
                    $r: source.$r == null ? z.undefined() : z.literal(source.$r),
                })
                .and(z.object(mapRecord(source.value, value => state(value)))) as any;
        }
    }
};

export type UpOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], NullableTextOperation.UpOperation, TextOperation.UpOperation>
    : T extends ReplaceValueTemplate<infer U1>
      ? { newValue: z.TypeOf<U1> }
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

export const upOperation = <T extends AnyTemplate>(source: T): z.ZodType<UpOperation<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return z.object({ newValue: source.value }) as any;
                case ot:
                    return source.nullable
                        ? NullableTextOperation.upOperation
                        : (TextOperation.upOperation as any);
            }
            break;
        }
        case record: {
            return zrecord(
                recordUpOperationElementFactory(state(source.value), upOperation(source.value)),
            ) as any;
        }
        case paramRecord:
            return zrecord(upOperation(source.value)) as any;
        case object: {
            return z
                .object({
                    $v: source.$v == null ? z.undefined() : z.literal(source.$v),
                    $r: source.$r == null ? z.undefined() : z.literal(source.$r),
                })
                .and(
                    z.object(mapRecord(source.value, value => upOperation(value))).partial(),
                ) as any;
        }
    }
};

export type DownOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], NullableTextOperation.DownOperation, TextOperation.DownOperation>
    : T extends ReplaceValueTemplate<infer U1>
      ? { oldValue: z.TypeOf<U1> }
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

export const downOperation = <T extends AnyTemplate>(source: T): z.ZodType<DownOperation<T>> => {
    switch (source.type) {
        case atomic: {
            switch (source.mode) {
                case replace:
                    return z.object({ oldValue: source.value }) as any;
                case ot:
                    return source.nullable
                        ? NullableTextOperation.downOperation
                        : (TextOperation.downOperation as any);
            }
            break;
        }
        case record: {
            return zrecord(
                recordDownOperationElementFactory(state(source.value), downOperation(source.value)),
            ) as any;
        }
        case paramRecord: {
            return zrecord(downOperation(source.value)) as any;
        }
        case object: {
            const base = z
                .object({
                    $v: source.$v == null ? z.undefined() : z.literal(source.$v),
                    $r: source.$r == null ? z.undefined() : z.literal(source.$r),
                })
                .and(
                    z.object(mapRecord(source.value, value => downOperation(value))).partial(),
                ) as any;
            return base;
        }
    }
};

export type TwoWayOperation<T extends AnyTemplate> = T extends OtValueTemplate
    ? If<T['nullable'], NullableTextOperation.TwoWayOperation, TextOperation.TwoWayOperation>
    : T extends ReplaceValueTemplate<infer U1>
      ? {
            oldValue: z.TypeOf<U1>;
            newValue: z.TypeOf<U1>;
        }
      : T extends RecordValueTemplate<infer U2>
        ? {
              [P in string]?:
                  | RecordTwoWayOperationElement<State<U2>, TwoWayOperation<U2>>
                  | undefined;
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
