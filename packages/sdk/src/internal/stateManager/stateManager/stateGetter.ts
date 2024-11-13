import { Option } from '@kizahasi/option';
import { Diff } from './types';

// syncedState、postingState、uiStateが中心で、diffは関数で求めるというコンセプト。

type PostingState<TState, TOperation, TMetadata> = {
    operation: TOperation | undefined;
    state: TState;
    metadata: TMetadata;
};

export class StateGetter<TState, TOperation, TMetadata> {
    /**
     * クライアントから見た、API サーバーにおける最新の State。
     *
     * ただし、通信のラグなどの影響で、実際の最新の状態より少し古い可能性があります。
     */
    public syncedState: TState;

    private _diff: Diff<TState, TOperation>;

    // this._syncedStateにthis._postingState.operationをapplyした結果がstateになる。通常、this._postingState.operationをAPIサーバーに送信して、その応答を待つ形になる。
    // operationは、transformの結果idになることもあり得るので、undefinedも代入可能にしている。
    private _postingState: PostingState<TState, TOperation, TMetadata> | undefined;

    private _uiStateCore: Option<TState> = Option.none();

    public constructor({
        syncedState,
        diff,
    }: {
        syncedState: TState;
        diff: Diff<TState, TOperation>;
    }) {
        this.syncedState = syncedState;
        this._diff = diff;
    }

    /**
     * クライアントの画面に表示すべき State。
     */
    public get uiState(): TState {
        if (this._uiStateCore.isNone) {
            return this._postingState?.state ?? this.syncedState;
        }
        return this._uiStateCore.value;
    }

    public setUiState(value: TState) {
        this._uiStateCore = Option.some(value);
    }

    /** `uiState` を `syncedState` の状態に戻します。 */
    public clearUiState() {
        this._uiStateCore = Option.none();
    }

    /** API サーバーに Operation の post を開始した時点の State。 */
    public get postingState(): Readonly<PostingState<TState, TOperation, TMetadata>> | undefined {
        return this._postingState;
    }

    public setPostingState(state: TState, metadata: TMetadata) {
        this._postingState = {
            state,
            operation: this._diff({ prevState: this.syncedState, nextState: state }),
            metadata,
        };
    }

    public clearPostingState() {
        this._postingState = undefined;
    }

    /**
     * まだpostしていないoperation。
     *
     * post中の場合は、post後にクライアント側でたまっているoperationを表します。post中でないときは、単にクライアント側でたまっているoperationを表します。
     */
    public getLocalOperation(): TOperation | undefined {
        if (this._uiStateCore.isNone) {
            return undefined;
        }
        const result = this._diff({
            prevState: this._postingState?.state ?? this.syncedState,
            nextState: this.uiState,
        });
        if (result == null) {
            this._uiStateCore = Option.none();
        }
        return result;
    }
}
