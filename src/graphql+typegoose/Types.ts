export type RestoreResult<TState, TTwoWayOperation> = { prevState: TState; twoWayOperation: TTwoWayOperation }

export type TransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
}

export type ProtectedTransformParameters<TServerState, TFirstOperation, TSecondOperation> = {
    first?: TFirstOperation;
    second: TSecondOperation;
    prevState: TServerState;
    nextState: TServerState;
}