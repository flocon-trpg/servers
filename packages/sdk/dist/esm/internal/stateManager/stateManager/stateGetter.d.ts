import { Diff } from './types';
type PostingState<TState, TOperation, TMetadata> = {
    operation: TOperation | undefined;
    state: TState;
    metadata: TMetadata;
};
export declare class StateGetter<TState, TOperation, TMetadata> {
    syncedState: TState;
    private _diff;
    private _postingState;
    private _uiStateCore;
    constructor({ syncedState, diff, }: {
        syncedState: TState;
        diff: Diff<TState, TOperation>;
    });
    get uiState(): TState;
    setUiState(value: TState): void;
    clearUiState(): void;
    get postingState(): Readonly<PostingState<TState, TOperation, TMetadata>> | undefined;
    setPostingState(state: TState, metadata: TMetadata): void;
    clearPostingState(): void;
    getLocalOperation(): TOperation | undefined;
}
export {};
//# sourceMappingURL=stateGetter.d.ts.map