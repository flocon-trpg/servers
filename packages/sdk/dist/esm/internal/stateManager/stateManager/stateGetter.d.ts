import { Diff } from './types';
type PostingState<TState, TOperation, TMetadata> = {
    operation: TOperation | undefined;
    state: TState;
    metadata: TMetadata;
};
export declare class StateGetter<TState, TOperation, TMetadata> {
    /**
     * クライアントから見た、API サーバーにおける最新の State。
     *
     * ただし、通信のラグなどの影響で、実際の最新の状態より少し古い可能性があります。
     */
    syncedState: TState;
    private _diff;
    private _postingState;
    private _uiStateCore;
    constructor({ syncedState, diff, }: {
        syncedState: TState;
        diff: Diff<TState, TOperation>;
    });
    /**
     * クライアントの画面に表示すべき State。
     */
    get uiState(): TState;
    setUiState(value: TState): void;
    /** `uiState` を `syncedState` の状態に戻します。 */
    clearUiState(): void;
    /** API サーバーに Operation の post を開始した時点の State。 */
    get postingState(): Readonly<PostingState<TState, TOperation, TMetadata>> | undefined;
    setPostingState(state: TState, metadata: TMetadata): void;
    clearPostingState(): void;
    /**
     * まだpostしていないoperation。
     *
     * post中の場合は、post後にクライアント側でたまっているoperationを表します。post中でないときは、単にクライアント側でたまっているoperationを表します。
     */
    getLocalOperation(): TOperation | undefined;
}
export {};
//# sourceMappingURL=stateGetter.d.ts.map