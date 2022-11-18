import { ApplyError, ComposeAndTransformError, NonEmptyString, PositiveInt } from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';
export declare type ScalarError = string | ApplyError<PositiveInt>;
export declare type UpError = string | ApplyError<PositiveInt> | ComposeAndTransformError<NonEmptyString, PositiveInt>;
export declare type DownError = string | ApplyError<PositiveInt> | ComposeAndTransformError<PositiveInt, NonEmptyString>;
export declare type TwoWayError = string | ApplyError<PositiveInt> | ComposeAndTransformError<NonEmptyString, NonEmptyString>;
/**
 * `state`に対して`operation`を適用します。
 */
export declare type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => Result<TState, ScalarError>;
export declare type Compose<TOperation, Error> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<TOperation | undefined, Error>;
export declare type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;
export declare type Restore<TState, TDownOperation, TTwoWayOperation> = (params: {
    nextState: TState;
    downOperation: TDownOperation;
}) => Result<{
    prevState: TState;
    twoWayOperation: TTwoWayOperation | undefined;
}, ScalarError>;
/** `apply(stateBeforeServerOperation, serverOperation) = stateAfterServerOperation` という関係が成り立ちます。 */
export declare type ServerTransform<TServerState, TTwoWayOperation, TUpOperation> = (params: {
    stateBeforeServerOperation: TServerState;
    stateAfterServerOperation: TServerState;
    serverOperation: TTwoWayOperation | undefined;
    clientOperation: TUpOperation;
}) => Result<TTwoWayOperation | undefined, TwoWayError>;
export declare type ClientTransform<TOperation> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<{
    firstPrime: TOperation | undefined;
    secondPrime: TOperation | undefined;
}, UpError>;
export declare type ToClientOperationParams<TState, TOperation> = {
    prevState: TState;
    nextState: TState;
    diff: TOperation;
};
//# sourceMappingURL=type.d.ts.map