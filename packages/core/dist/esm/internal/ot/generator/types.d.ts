import { z } from 'zod';
import * as NullableTextOperation from '../nullableTextOperation';
import { RecordDownOperationElement, RecordTwoWayOperationElement, RecordUpOperationElement } from '../recordOperationElement';
import * as TextOperation from '../textOperation';
type ReadonlyRecord<TKey extends keyof any, TValue> = {
    readonly [P in TKey]: TValue;
};
export declare const atomic = "atomic";
export declare const replace = "replace";
export declare const ot = "ot";
export declare const record = "record";
export declare const paramRecord = "paramRecord";
export declare const object = "object";
export type ReplaceValueTemplate<T extends z.ZodTypeAny> = {
    type: typeof atomic;
    mode: typeof replace;
    value: T;
};
/** Stateならば`T`に、TwoWayOperationならば`{ oldValue:T; newValue:T }`に変換されるtemplateを作成します。*/
export declare const createReplaceValueTemplate: <T extends z.ZodTypeAny>(value: T) => {
    readonly type: "atomic";
    readonly mode: "replace";
    readonly value: T;
};
export type OtValueTemplate = {
    type: typeof atomic;
    mode: typeof ot;
    nullable: boolean;
    value?: undefined;
};
/** Stateならば`string`(ただし`nullable === true`のときは代わりに`string | undefined`となます。`undefined`は`''`と同一として扱われます)に、TwoWayOperationならば変化のある部分のみを抽出したOperationに変換されるtemplateを作成します。*/
export declare const createTextValueTemplate: <T extends boolean>(nullable: T) => {
    readonly type: "atomic";
    readonly mode: "ot";
    readonly nullable: T;
};
export type RecordValueTemplate<TValue extends AnyTemplate> = {
    type: typeof record;
    value: TValue;
};
/** `Record<string, T>`を表すtemplateを作成します。*/
export declare const createRecordValueTemplate: <TValue extends AnyTemplate>(value: TValue) => RecordValueTemplate<TValue>;
export type ParamRecordValueTemplate<TValue extends AnyTemplate> = {
    type: typeof paramRecord;
    value: TValue;
    defaultState: State<TValue>;
};
/** `Record<string, T>`を表すtemplateを作成します。存在しない要素はdefaultStateがセットされているとみなされます。 */
export declare const createParamRecordValueTemplate: <TValue extends AnyTemplate>(value: TValue, defaultState: State<TValue>) => {
    readonly type: "paramRecord";
    readonly value: TValue;
    readonly defaultState: State<TValue>;
};
export type ObjectValueTemplate<T extends ReadonlyRecord<string, AnyTemplate>, V extends number | undefined, R extends number | undefined> = {
    type: typeof object;
    $v: V;
    $r: R;
    value: {
        readonly [P in keyof T]: T[P];
    };
};
/** 複数のtemplateから構成される新たなtemplateを作成します。 */
export declare const createObjectValueTemplate: <T extends ReadonlyRecord<string, AnyTemplate>, V extends number | undefined, R extends number | undefined>(value: T, $v: V, $r: R) => {
    readonly type: "object";
    readonly $v: V;
    readonly $r: R;
    readonly value: T;
};
export type AnyTemplate = ReplaceValueTemplate<z.ZodTypeAny> | OtValueTemplate | {
    type: typeof record;
    value: AnyTemplate;
} | {
    type: typeof paramRecord;
    value: AnyTemplate;
    defaultState: any;
} | {
    type: typeof object;
    $v: number | undefined;
    $r: number | undefined;
    value: {
        readonly [P in string]: AnyTemplate;
    };
};
type If<T extends boolean, TTrue, TFalse> = T extends true ? TTrue : T extends false ? TFalse : TTrue | TFalse;
type ParamRecordValueTemplateBase<TValue extends AnyTemplate> = {
    type: typeof paramRecord;
    value: TValue;
};
export type State<T extends AnyTemplate> = T extends OtValueTemplate ? If<T['nullable'], string | undefined, string> : T extends ReplaceValueTemplate<infer U1> ? z.TypeOf<U1> : T extends RecordValueTemplate<infer U2> ? {
    [P in string]?: State<U2> | undefined;
} | undefined : T extends ParamRecordValueTemplateBase<infer U3> ? {
    [P in string]?: State<U3> | undefined;
} | undefined : T extends ObjectValueTemplate<infer U4, infer UV, infer UR> ? {
    $v: UV;
    $r: UR;
} & {
    [P in keyof U4]: State<U4[P]>;
} : unknown;
export declare const state: <T extends AnyTemplate>(source: T) => z.ZodType<State<T>, z.ZodTypeDef, State<T>>;
export type UpOperation<T extends AnyTemplate> = T extends OtValueTemplate ? If<T['nullable'], NullableTextOperation.UpOperation, TextOperation.UpOperation> : T extends ReplaceValueTemplate<infer U1> ? {
    newValue: z.TypeOf<U1>;
} : T extends RecordValueTemplate<infer U2> ? {
    [P in string]?: RecordUpOperationElement<State<U2>, UpOperation<U2>> | undefined;
} : T extends ParamRecordValueTemplate<infer U2> ? {
    [P in string]?: UpOperation<U2> | undefined;
} : T extends ObjectValueTemplate<infer U3, infer UV, infer UR> ? {
    $v: UV;
    $r: UR;
} & {
    [P in keyof U3]?: UpOperation<U3[P]>;
} : unknown;
export declare const upOperation: <T extends AnyTemplate>(source: T) => z.ZodType<UpOperation<T>, z.ZodTypeDef, UpOperation<T>>;
export type DownOperation<T extends AnyTemplate> = T extends OtValueTemplate ? If<T['nullable'], NullableTextOperation.DownOperation, TextOperation.DownOperation> : T extends ReplaceValueTemplate<infer U1> ? {
    oldValue: z.TypeOf<U1>;
} : T extends RecordValueTemplate<infer U2> ? {
    [P in string]?: RecordDownOperationElement<State<U2>, DownOperation<U2>> | undefined;
} : T extends ParamRecordValueTemplate<infer U2> ? {
    [P in string]?: DownOperation<U2> | undefined;
} : T extends ObjectValueTemplate<infer U3, infer UV, infer UR> ? {
    $v: UV;
    $r: UR;
} & {
    [P in keyof U3]?: DownOperation<U3[P]>;
} : unknown;
export declare const downOperation: <T extends AnyTemplate>(source: T) => z.ZodType<DownOperation<T>, z.ZodTypeDef, DownOperation<T>>;
export type TwoWayOperation<T extends AnyTemplate> = T extends OtValueTemplate ? If<T['nullable'], NullableTextOperation.TwoWayOperation, TextOperation.TwoWayOperation> : T extends ReplaceValueTemplate<infer U1> ? {
    oldValue: z.TypeOf<U1>;
    newValue: z.TypeOf<U1>;
} : T extends RecordValueTemplate<infer U2> ? {
    [P in string]?: RecordTwoWayOperationElement<State<U2>, TwoWayOperation<U2>> | undefined;
} : T extends ParamRecordValueTemplate<infer U2> ? {
    [P in string]?: TwoWayOperation<U2> | undefined;
} : T extends ObjectValueTemplate<infer U4, infer UV, infer UR> ? {
    $v: UV;
    $r: UR;
} & {
    [P in keyof U4]?: TwoWayOperation<U4[P]>;
} : unknown;
export {};
//# sourceMappingURL=types.d.ts.map