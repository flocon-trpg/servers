import { StateManagerParameters } from './types';
type OnPosted<T> = {
    isSuccess: true;
    isId: false;
    revisionTo: number;
    result: T;
} | {
    isSuccess: true;
    isId: true;
    requestId: string;
} | {
    isSuccess: false | null;
};
export type PostResult<TState, TOperation> = {
    operationToPost: TOperation;
    syncedState: TState;
    revision: number;
    requestId: string;
    onPosted: (onPosted: OnPosted<TOperation>) => void;
};
export declare class StateManager<TState, TOperation> {
    private readonly args;
    private core;
    private _requiresReload;
    private _history?;
    constructor(args: StateManagerParameters<TState, TOperation>);
    get isPosting(): boolean;
    get uiState(): TState;
    get revision(): number;
    get requiresReload(): boolean;
    waitingResponseSince(): Date | null;
    onOtherClientsGet(operation: TOperation, revisionTo: number): void;
    setUiState(state: TState): void;
    setUiStateByApply(operation: TOperation): void;
    post(): PostResult<TState, TOperation> | undefined;
    reload({ state, revision }: {
        state: TState;
        revision: number;
    }): void;
    get history(): readonly ({
        type: "operate";
        revision: number;
        nextState: TState;
    } | {
        type: "beforePost";
        uiState: TState;
    } | {
        type: "posting";
        uiState: TState;
        value: Omit<PostResult<TState, TOperation>, "onPosted"> | undefined;
    } | {
        type: "beforeEndPostAsSuccess";
        operation: TOperation;
        uiState: TState;
        revisionTo: number;
    } | {
        type: "afterEndPostAsSuccess";
        uiState: TState;
    } | {
        type: "beforeEndPostAsId";
        requestId: string;
        uiState: TState;
    } | {
        type: "afterEndPostAsId";
        uiState: TState;
    } | {
        type: "beforeEndPostAsNotSuccess";
        uiState: TState;
    } | {
        type: "afterEndPostAsNotSuccess";
        uiState: TState;
    } | {
        type: "endPostAsUnknown";
        uiState: TState;
    } | {
        type: "beforeOtherClientsGet";
        uiState: TState;
        operation: TOperation;
        revisionTo: number;
    } | {
        type: "afterOtherClientsGet";
        uiState: TState;
    })[] | undefined;
}
export {};
//# sourceMappingURL=stateManager.d.ts.map