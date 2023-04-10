import { ApplyError, ComposeAndTransformError, PositiveInt } from '@kizahasi/ot-core';
import { NonEmptyString } from '@kizahasi/ot-string';
import { Result } from '@kizahasi/result';

export type ScalarError = string | ApplyError<NonEmptyString, PositiveInt>;
export type UpError =
    | string
    | ApplyError<NonEmptyString, PositiveInt>
    | ComposeAndTransformError<NonEmptyString, PositiveInt>;
export type DownError =
    | string
    | ApplyError<NonEmptyString, PositiveInt>
    | ComposeAndTransformError<PositiveInt, NonEmptyString>;
export type TwoWayError =
    | string
    | ApplyError<NonEmptyString, PositiveInt>
    | ComposeAndTransformError<NonEmptyString, NonEmptyString>;

/**
 * `state`に対して`operation`を適用します。
 */
export type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => Result<TState, ScalarError>;

export type Compose<TOperation, Error> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<TOperation | undefined, Error>;

export type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;

export type Restore<TState, TDownOperation, TTwoWayOperation> = (params: {
    nextState: TState;
    downOperation: TDownOperation;
}) => Result<
    {
        prevState: TState;
        twoWayOperation: TTwoWayOperation | undefined;
    },
    ScalarError
>;

/** `apply(stateBeforeServerOperation, serverOperation) = stateAfterServerOperation` という関係が成り立ちます。 */
export type ServerTransform<TServerState, TTwoWayOperation, TUpOperation> = (params: {
    stateBeforeServerOperation: TServerState;
    stateAfterServerOperation: TServerState;
    serverOperation: TTwoWayOperation | undefined;
    clientOperation: TUpOperation;
}) => Result<TTwoWayOperation | undefined, TwoWayError>;

export type ClientTransform<TOperation> = (params: {
    first: TOperation;
    second: TOperation;
}) => Result<{ firstPrime: TOperation | undefined; secondPrime: TOperation | undefined }, UpError>;

// Ensure this:
// - diff(prevState) = nextState
//
// 全てのStateはdiffでoperationを求めることができるため、必須ではない。ただ、TextOperationなどは少しコストが高いため、再度diffを求めるのを避けるために渡したほうがいいのと、diffをそのまま返せば済む場面も少なくないのでdiffを必須としている。
export type ToClientOperationParams<TState, TOperation> = {
    prevState: TState;
    nextState: TState;
    diff: TOperation;
};
