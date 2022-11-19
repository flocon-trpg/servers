export declare type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => TState;
export declare type Compose<TState, TOperation> = (params: {
    state: TState;
    first: TOperation;
    second: TOperation;
}) => TOperation;
export declare type Transform<TFirstOperation, TSecondOperation> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => {
    firstPrime: TFirstOperation;
    secondPrime: TSecondOperation;
};
export declare type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;
export declare type StateManagerParameters<TState, TOperation> = {
    revision: number;
    state: TState;
    apply: Apply<TState, TOperation>;
    transform: Transform<TOperation, TOperation>;
    diff: Diff<TState, TOperation>;
    enableHistory?: boolean;
};
//# sourceMappingURL=types.d.ts.map