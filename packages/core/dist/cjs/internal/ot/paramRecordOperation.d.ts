import { Result } from '@kizahasi/result';
import { StringKeyRecord } from './record';
import * as RecordOperation from './recordOperation';
type RestoreResult<TState, TTwoWayOperation> = {
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
};
export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = RecordOperation.ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation>;
export declare const restore: <TState, TDownOperation, TTwoWayOperation, TCustomError = string>({ nextState: unsafeNextState, downOperation: unsafeDownOperation, innerRestore, }: {
    nextState: StringKeyRecord<TState>;
    downOperation?: StringKeyRecord<TDownOperation> | undefined;
    innerRestore: (params: {
        downOperation: TDownOperation;
        nextState: TState;
        key: string;
    }) => Result<RestoreResult<TState, TTwoWayOperation> | undefined, string | TCustomError>;
}) => Result<RestoreResult<StringKeyRecord<TState>, StringKeyRecord<TTwoWayOperation>>, string | TCustomError>;
export declare const apply: <TState, TUpOperation, TCustomError = string>({ prevState: unsafePrevState, operation, innerApply, defaultState, }: {
    prevState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<TUpOperation> | undefined;
    innerApply: (params: {
        operation: TUpOperation;
        prevState: TState;
        key: string;
    }) => Result<TState, string | TCustomError>;
    defaultState: TState;
}) => Result<StringKeyRecord<TState>, string | TCustomError>;
export declare const applyBack: <TState, TDownOperation, TCustomError = string>({ nextState: unsafeNextState, operation, innerApplyBack, defaultState, }: {
    nextState: StringKeyRecord<TState>;
    operation?: StringKeyRecord<TDownOperation> | undefined;
    innerApplyBack: (params: {
        operation: TDownOperation;
        nextState: TState;
        key: string;
    }) => Result<TState, string | TCustomError>;
    defaultState: TState;
}) => Result<StringKeyRecord<TState>, string | TCustomError>;
export declare const compose: <TOperation, TCustomError = string>({ first, second, innerCompose, }: {
    first?: StringKeyRecord<TOperation> | undefined;
    second?: StringKeyRecord<TOperation> | undefined;
    innerCompose: (params: {
        key: string;
        first: TOperation;
        second: TOperation;
    }) => Result<TOperation | undefined, string | TCustomError>;
}) => Result<StringKeyRecord<TOperation> | undefined, string | TCustomError>;
/** Make sure `apply(stateBeforeFirst, first) = stateAfterFirst` */
export declare const serverTransform: <TServerState, TFirstOperation, TSecondOperation, TCustomError = string>({ first: unsafeFirst, second: unsafeSecond, stateBeforeFirst: unsafeStateBeforeFirst, stateAfterFirst: unsafeStateAfterFirst, innerTransform, defaultState, }: {
    stateBeforeFirst: StringKeyRecord<TServerState>;
    stateAfterFirst: StringKeyRecord<TServerState>;
    first?: StringKeyRecord<TFirstOperation> | undefined;
    second?: StringKeyRecord<TSecondOperation> | undefined;
    innerTransform: (params: ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> & {
        key: string;
    }) => Result<TFirstOperation | undefined, string | TCustomError>;
    defaultState: TServerState;
}) => Result<StringKeyRecord<TFirstOperation> | undefined, string | TCustomError>;
type InnerClientTransform<TOperation, TError = string> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<{
    firstPrime: TOperation | undefined;
    secondPrime: TOperation | undefined;
}, TError>;
export declare const clientTransform: <TOperation, TError = string>({ first, second, innerTransform, }: {
    first?: StringKeyRecord<TOperation> | undefined;
    second?: StringKeyRecord<TOperation> | undefined;
    innerTransform: InnerClientTransform<TOperation, TError>;
}) => Result<{
    firstPrime: StringKeyRecord<TOperation> | undefined;
    secondPrime: StringKeyRecord<TOperation> | undefined;
}, TError>;
export declare const diff: <TState, TOperation>({ prevState, nextState, innerDiff, }: {
    prevState: StringKeyRecord<TState>;
    nextState: StringKeyRecord<TState>;
    innerDiff: (params: {
        prevState: TState | undefined;
        nextState: TState | undefined;
        key: string;
    }) => TOperation | undefined;
}) => StringKeyRecord<TOperation> | undefined;
export {};
//# sourceMappingURL=paramRecordOperation.d.ts.map