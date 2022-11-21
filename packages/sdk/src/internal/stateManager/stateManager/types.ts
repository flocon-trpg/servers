export type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => TState;

export type Compose<TState, TOperation> = (params: {
    state: TState;
    first: TOperation;
    second: TOperation;
}) => TOperation;

export type Transform<TFirstOperation, TSecondOperation> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => { firstPrime: TFirstOperation; secondPrime: TSecondOperation };

export type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;

export type StateManagerParameters<TState, TOperation> = {
    revision: number;
    state: TState;
    apply: Apply<TState, TOperation>;
    transform: Transform<TOperation, TOperation>;
    diff: Diff<TState, TOperation>;

    // if true, debugging gets easier but makes StateManager slower
    enableHistory?: boolean;
};
