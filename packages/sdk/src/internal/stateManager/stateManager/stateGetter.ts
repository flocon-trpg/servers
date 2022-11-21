import { Option } from '@kizahasi/option';
import { Diff } from './types';

// syncedState、postingState、uiStateが中心で、diffは関数で求めるというコンセプト。

type PostingState<TState, TOperation, TMetadata> = {
    operation: TOperation | undefined;
    state: TState;
    metadata: TMetadata;
};

export class StateGetter<TState, TOperation, TMetadata> {
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

    public get uiState(): TState {
        if (this._uiStateCore.isNone) {
            return this._postingState?.state ?? this.syncedState;
        }
        return this._uiStateCore.value;
    }

    public setUiState(value: TState) {
        this._uiStateCore = Option.some(value);
    }

    public clearUiState() {
        this._uiStateCore = Option.none();
    }

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

    // まだpostしていないoperationを表す。
    // 詳しく書くと、post中の場合は、post後にクライアント側でたまっているoperationを表す。post中でないときは、単にクライアント側でたまっているoperationを表す。
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
