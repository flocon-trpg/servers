import { Result } from '@kizahasi/result';
import { StringKeyRecord } from './record';
import { RecordDownOperationElement, RecordTwoWayOperationElement, RecordUpOperationElement, replace, update } from './recordOperationElement';
type RecordOperationElement<TReplace, TUpdate> = {
    type: typeof update;
    update: TUpdate;
} | {
    type: typeof replace;
    replace: TReplace;
};
type RecordOperation<TReplace, TUpdate> = Record<string, RecordOperationElement<TReplace, TUpdate> | undefined>;
export type RecordDownOperation<TState, TOperation> = Record<string, RecordDownOperationElement<TState, TOperation> | undefined>;
export type RecordUpOperation<TState, TOperation> = Record<string, RecordUpOperationElement<TState, TOperation> | undefined>;
export type RecordTwoWayOperation<TState, TOperation> = Record<string, RecordTwoWayOperationElement<TState, TOperation> | undefined>;
type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
};
export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
    nextState: TServerState;
};
/**
 * trueを返すと、「TServerState全体がprivateであり編集不可能」とみなしてスキップします。ただし制限されるのはtransformのみであるため、読み取りなどは制限されません。
 *
 * 「ユーザーがprivateだと思っていたらその後すぐ変更があってprivateになった」というケースがあるので、trueでもエラーは返さず処理が続行されます。
 *
 *  関数ではなくundefinedを渡した場合、常にfalseを返す関数が渡されたときと同等の処理が行われます。
 */
export type CancellationPolicy<TKey, TServerState> = {
    cancelRemove?: (params: {
        key: TKey;
        state: TServerState;
    }) => boolean;
    cancelUpdate?: (params: {
        key: TKey;
        prevState: TServerState;
        nextState: TServerState;
    }) => boolean;
    cancelCreate?: (params: {
        key: TKey;
        newState: TServerState;
    }) => boolean;
};
/** Make sure `apply(prevState, source) = nextState` */
export declare const toClientState: <TSourceState, TClientState>({ serverState, isPrivate, toClientState, }: {
    serverState: StringKeyRecord<TSourceState> | undefined;
    isPrivate: (state: TSourceState, key: string) => boolean;
    toClientState: (params: {
        state: TSourceState;
        key: string;
    }) => TClientState;
}) => Record<string, TClientState> | undefined;
export declare const restore: <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({ nextState, downOperation, innerRestore, innerDiff, }: {
    nextState: StringKeyRecord<TState>;
    downOperation?: StringKeyRecord<RecordDownOperationElement<TState, TDownOperation>> | undefined;
    innerRestore: (params: {
        key: string;
        downOperation: TDownOperation;
        nextState: TState;
    }) => Result<RestoreResult<TState, TTwoWayOperation | undefined>, string | TCustomError>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TTwoWayOperation | undefined;
}) => Result<RestoreResult<StringKeyRecord<TState>, RecordTwoWayOperation<TState, TTwoWayOperation>>, string | TCustomError>;
export declare const apply: <TState, TOperation, TCustomError = string>({ prevState, operation, innerApply, }: {
    prevState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<RecordUpOperationElement<TState, TOperation>> | undefined;
    innerApply: (params: {
        key: string;
        operation: TOperation;
        prevState: TState;
    }) => Result<TState, string | TCustomError>;
}) => Result<StringKeyRecord<TState>, string | TCustomError>;
export declare const applyBack: <TState, TDownOperation, TCustomError = string>({ nextState, operation, innerApplyBack, }: {
    nextState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<RecordDownOperationElement<TState, TDownOperation>> | undefined;
    innerApplyBack: (params: {
        key: string;
        operation: TDownOperation;
        state: TState;
    }) => Result<TState, string | TCustomError>;
}) => Result<StringKeyRecord<TState>, string | TCustomError>;
export declare const compose: <TReplace, TUpdate, TError>({ first, second, composeReplaceReplace, composeReplaceUpdate, composeUpdateReplace, composeUpdateUpdate, }: {
    first?: RecordOperation<TReplace, TUpdate> | undefined;
    second?: RecordOperation<TReplace, TUpdate> | undefined;
    composeReplaceReplace: (params: {
        first: TReplace;
        second: TReplace;
        key: string;
    }) => Result<TReplace | undefined, TError>;
    composeReplaceUpdate: (params: {
        first: TReplace;
        second: TUpdate;
        key: string;
    }) => Result<TReplace | undefined, TError>;
    composeUpdateReplace: (params: {
        first: TUpdate;
        second: TReplace;
        key: string;
    }) => Result<TReplace | undefined, TError>;
    composeUpdateUpdate: (params: {
        first: TUpdate;
        second: TUpdate;
        key: string;
    }) => Result<TUpdate | undefined, TError>;
}) => Result<RecordOperation<TReplace, TUpdate> | undefined, TError>;
export declare const composeDownOperation: <TState, TDownOperation, TCustomError = string>({ first, second, innerApplyBack, innerCompose, }: {
    first?: RecordDownOperation<TState, TDownOperation> | undefined;
    second?: RecordDownOperation<TState, TDownOperation> | undefined;
    innerApplyBack: (params: {
        key: string;
        operation: TDownOperation;
        state: TState;
    }) => Result<TState, string | TCustomError>;
    innerCompose: (params: {
        key: string;
        first: TDownOperation;
        second: TDownOperation;
    }) => Result<TDownOperation | undefined, string | TCustomError>;
}) => Result<RecordDownOperation<TState, TDownOperation> | undefined, string | TCustomError>;
type ServerTransformCoreParams<TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError> = {
    stateBeforeFirst: StringKeyRecord<TServerState>;
    stateAfterFirst: StringKeyRecord<TServerState>;
    first?: RecordUpOperation<TServerState, TFirstOperation>;
    second?: RecordUpOperation<TClientState, TSecondOperation>;
    /** `TClientState` を `TServerState` に変換します。`create` される値の変換を行っても構いません。 */
    toServerState: (state: TClientState, key: string) => TServerState;
    innerTransform: (params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
        key: string;
    }) => Result<TFirstOperation | undefined, string | TCustomError>;
    cancellationPolicy: CancellationPolicy<string, TServerState>;
};
export type ServerTransformParams<TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError> = ServerTransformCoreParams<TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError> & {
    /** 制限を設けることができます。指定した制限を満たさない場合は Result.error が返されます。 */
    validation?: {
        /** このRecordの名前です。エラーメッセージを生成する際に用いられます。 */
        recordName: string;
        /** Record の要素の数の最大値。要素の追加後に、要素の数がこれを超える場合はエラーとなります。追加以外の操作では無視されます。 */
        maxRecordLength?: number;
    };
};
/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
export declare const serverTransform: <TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError = string>(params: ServerTransformParams<TServerState, TClientState, TFirstOperation, TSecondOperation, TCustomError>) => Result<RecordTwoWayOperation<TServerState, TFirstOperation> | undefined, string | TCustomError>;
type InnerClientTransform<TFirstOperation, TSecondOperation, TError = string> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => Result<{
    firstPrime: TFirstOperation | undefined;
    secondPrime: TSecondOperation | undefined;
}, TError>;
type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;
export declare const clientTransform: <TState, TOperation, TError = string>({ first, second, innerTransform, innerDiff, }: {
    first?: RecordUpOperation<TState, TOperation> | undefined;
    second?: RecordUpOperation<TState, TOperation> | undefined;
    innerTransform: InnerClientTransform<TOperation, TOperation, TError>;
    innerDiff: Diff<TState, TOperation>;
}) => Result<{
    firstPrime: RecordUpOperation<TState, TOperation> | undefined;
    secondPrime: RecordUpOperation<TState, TOperation> | undefined;
}, TError>;
export declare const diff: <TState, TOperation>({ prevState, nextState, innerDiff, }: {
    prevState: StringKeyRecord<TState>;
    nextState: StringKeyRecord<TState>;
    innerDiff: (params: {
        key: string;
        prevState: TState;
        nextState: TState;
    }) => TOperation | undefined;
}) => Record<string, RecordTwoWayOperationElement<TState, TOperation>> | undefined;
export declare const mapRecordUpOperation: <TState1, TState2, TOperation1, TOperation2>({ source, mapState, mapOperation, }: {
    source: Record<string, RecordUpOperationElement<TState1, TOperation1> | undefined>;
    mapState: (state: TState1) => TState2;
    mapOperation: (operation: TOperation1) => TOperation2;
}) => Record<string, RecordUpOperationElement<TState2, TOperation2>>;
export declare const mapRecordDownOperation: <TState1, TState2, TOperation1, TOperation2>({ source, mapState, mapOperation, }: {
    source: Record<string, RecordDownOperationElement<TState1, TOperation1> | undefined>;
    mapState: (state: TState1) => TState2;
    mapOperation: (operation: TOperation1) => TOperation2;
}) => Record<string, RecordDownOperationElement<TState2, TOperation2>>;
export declare const mapRecordOperation: <TReplace1, TReplace2, TUpdate1, TUpdate2>({ source, mapReplace, mapUpdate, }: {
    source: Record<string, {
        type: typeof replace;
        replace: TReplace1;
    } | {
        type: typeof update;
        update: TUpdate1;
    } | undefined>;
    mapReplace: (state: TReplace1) => TReplace2;
    mapUpdate: (state: TUpdate1) => TUpdate2;
}) => Record<string, {
    type: typeof replace;
    replace: TReplace2;
} | {
    type: typeof update;
    update: TUpdate2;
}>;
export {};
//# sourceMappingURL=recordOperation.d.ts.map