import { Result } from '@kizahasi/result';
import { z } from 'zod';
import { State, TwoWayOperation, UpOperation } from './generator';
import { OmitVersion } from './generator/omitVersion';
import * as RecordOperation from './recordOperation';
export declare const $index = "$index";
/**
 * Record を 配列とみなすときに、その要素として必要な値が入った template を作成する際に用いる値。
 *
 * @example
 * ```
 * const linkedListTemplate = createRecordValueTemplate(
 *     createObjectValueTemplate(
 *         {
 *             ...indexObjectTemplateValue,
 *
 *             // add more properies...
 *         },
 *         1,
 *         1
 *     )
 * );
 * ```
 */
export declare const indexObjectTemplateValue: {
    /**
     * 自身の要素のインデックス。一般的な配列と同様に、0 から始まります。
     *
     * インデックスが他の要素と重複してはなりません。また、0 から順に連続的に割り当てる必要があります。
     */
    $index: {
        readonly type: "atomic";
        readonly mode: "replace";
        readonly value: z.ZodNumber;
    };
};
declare const indexObjectTemplate: {
    readonly type: "object";
    readonly $v: 1;
    readonly $r: 1;
    readonly value: {
        /**
         * 自身の要素のインデックス。一般的な配列と同様に、0 から始まります。
         *
         * インデックスが他の要素と重複してはなりません。また、0 から順に連続的に割り当てる必要があります。
         */
        $index: {
            readonly type: "atomic";
            readonly mode: "replace";
            readonly value: z.ZodNumber;
        };
    };
};
type IndexObjectState = OmitVersion<State<typeof indexObjectTemplate>>;
export type IndexObject = IndexObjectState;
type IndexObjectUpOperation = OmitVersion<UpOperation<typeof indexObjectTemplate>>;
type IndexObjectTwoWayOperation = OmitVersion<TwoWayOperation<typeof indexObjectTemplate>>;
type OtArray<T> = {
    key: string;
    value: T;
}[];
type ReadonlyOtArray<T> = Readonly<OtArray<T>>;
export declare const indexObjectsToArray: <T extends IndexObjectState>(linkedList: Record<string, T | undefined>) => Result<OtArray<T>, string>;
/**
 * 配列を Record に変換します。
 *
 * 引数に渡された `$index` は誤っていてもエラーにはならず、自動的かつ非破壊的に調整されます。
 */
export declare const arrayToIndexObjects: <T extends IndexObjectState>(array: readonly {
    key: string;
    value: T;
}[]) => Record<string, T | undefined>;
/**
 * 配列に対して serverTransform を行い、secondPrime を返します。
 *
 * 通常の Record の serverTransform の処理（つまり、`$index` 以外のプロパティの処理など）も内部で行われるため、通常の Record の serverTransform を別途実行することは避けてください。
 */
export declare const serverTransform: <TServerState extends IndexObjectState, TClientState extends IndexObjectState, TFirstOperation extends IndexObjectTwoWayOperation, TSecondOperation extends IndexObjectUpOperation, TCustomError = string>(params: {
    stateBeforeFirst: import("./record").StringKeyRecord<TServerState>;
    stateAfterFirst: import("./record").StringKeyRecord<TServerState>;
    first?: RecordOperation.RecordUpOperation<TServerState, TFirstOperation> | undefined;
    second?: RecordOperation.RecordUpOperation<TClientState, TSecondOperation> | undefined;
    toServerState: (state: TClientState, key: string) => TServerState;
    innerTransform: (params: RecordOperation.ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
        key: string;
    }) => Result<TFirstOperation | undefined, string | TCustomError>;
    cancellationPolicy: RecordOperation.CancellationPolicy<string, TServerState>;
} & {
    validation?: {
        recordName: string;
        maxRecordLength?: number | undefined;
    } | undefined;
} & {
    /** Operation の型を変換して、TFirstOperation にします。通常は、単に `$v` と `$r` を付与するだけで構いません。 */
    mapOperation: (operation: IndexObjectTwoWayOperation) => TFirstOperation;
}) => Result<RecordOperation.RecordTwoWayOperation<TServerState, TFirstOperation> | undefined, string | TCustomError>;
export {};
//# sourceMappingURL=array.d.ts.map