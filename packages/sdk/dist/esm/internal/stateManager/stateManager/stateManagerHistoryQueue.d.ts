import { PostResult, StateManager } from './stateManager';
type HistoryElement<TState, TOperation> = {
    type: 'operate';
    revision: number;
    nextState: TState;
} | {
    type: 'beforePost';
    uiState: TState;
} | {
    type: 'posting';
    uiState: TState;
    value: Omit<PostResult<TState, TOperation>, 'onPosted'> | undefined;
} | {
    type: 'beforeEndPostAsSuccess';
    operation: TOperation;
    uiState: TState;
    revisionTo: number;
} | {
    type: 'afterEndPostAsSuccess';
    uiState: TState;
} | {
    type: 'beforeEndPostAsId';
    requestId: string;
    uiState: TState;
} | {
    type: 'afterEndPostAsId';
    uiState: TState;
} | {
    type: 'beforeEndPostAsNotSuccess';
    uiState: TState;
} | {
    type: 'afterEndPostAsNotSuccess';
    uiState: TState;
} | {
    type: 'endPostAsUnknown';
    uiState: TState;
} | {
    type: 'beforeOtherClientsGet';
    uiState: TState;
    operation: TOperation;
    revisionTo: number;
} | {
    type: 'afterOtherClientsGet';
    uiState: TState;
};
export declare class StateManagerHistoryQueue<TState, TOperation> {
    private _history;
    private add;
    get history(): ReadonlyArray<HistoryElement<TState, TOperation>>;
    operateAsState(stateManager: StateManager<TState, TOperation>, state: TState): void;
    beforePost(stateManager: StateManager<TState, TOperation>): void;
    beginPost(stateManager: StateManager<TState, TOperation>, value: Omit<PostResult<TState, TOperation>, 'onPosted'> | undefined): void;
    beforeEndPostAsId(stateManager: StateManager<TState, TOperation>, requestId: string): void;
    afterEndPostAsId(stateManager: StateManager<TState, TOperation>): void;
    beforeEndPostAsSuccess(stateManager: StateManager<TState, TOperation>, operation: TOperation, revisionTo: number): void;
    afterEndPostAsSuccess(stateManager: StateManager<TState, TOperation>): void;
    beforeOtherClientsGet(stateManager: StateManager<TState, TOperation>, operation: TOperation, revisionTo: number): void;
    afterOtherClientsGet(stateManager: StateManager<TState, TOperation>): void;
    beforeEndPostAsNotSuccess(stateManager: StateManager<TState, TOperation>): void;
    afterEndPostAsNotSuccess(stateManager: StateManager<TState, TOperation>): void;
    endPostAsUnknown(stateManager: StateManager<TState, TOperation>): void;
}
export {};
//# sourceMappingURL=stateManagerHistoryQueue.d.ts.map