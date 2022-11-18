import { StateManagerParameters } from './types';
export declare class StateManagerCore<TState, TOperation> {
    private readonly params;
    private _revision;
    private _stateGetter;
    private readonly _pendingGetOperations;
    constructor(params: StateManagerParameters<TState, TOperation>);
    waitingResponseSince(): Date | null;
    get isPosting(): boolean;
    get syncedState(): TState;
    get uiState(): TState;
    get revision(): number;
    setUiState(state: TState): void;
    private tryApplyPendingGetOperations;
    onGet(operation: TOperation, revisionTo: number, isByMyClient: boolean): void;
    post(): {
        operationToPost: TOperation;
        syncedState: TState;
        revision: number;
        requestId: string;
    } | undefined;
    endPostAsId(requestId: string): boolean;
    cancelPost(): boolean;
}
//# sourceMappingURL=stateManagerCore.d.ts.map