import { StateManagerHistoryQueue } from './stateManagerHistory';
import { StateManagerCore } from './stateManagerCore';
import { StateManagerParameters } from './types';

type OnPosted<T> =
    | {
          isSuccess: true;
          isId: false;
          revisionTo: number;
          result: T;
      }
    | {
          isSuccess: true;
          isId: true;
          requestId: string;
      }
    | {
          isSuccess: false | null; // 確実に失敗したときはfalse、成功したか失敗したかわからないときはnull
      };

export type PostResult<TState, TOperation> = {
    operationToPost: TOperation;
    syncedState: TState;
    revision: number;
    requestId: string;
    onPosted: (onPosted: OnPosted<TOperation>) => void;
};

export class StateManager<TState, TOperation> {
    private core: StateManagerCore<TState, TOperation>;
    private _requiresReload = false;
    private _history?: StateManagerHistoryQueue<TState, TOperation>;

    public constructor(private readonly params: StateManagerParameters<TState, TOperation>) {
        this.core = new StateManagerCore<TState, TOperation>(params);
        this._history = params.enableHistory === true ? new StateManagerHistoryQueue() : undefined;
    }

    public get isPosting(): boolean {
        if (this.requiresReload) {
            return false;
        }
        return this.core.isPosting;
    }

    public get uiState(): TState {
        return this.core.uiState;
    }

    public get revision(): number {
        return this.core.revision;
    }

    public get requiresReload(): boolean {
        return this._requiresReload;
    }

    public waitingResponseSince(): Date | null {
        if (this.requiresReload) {
            return null;
        }
        return this.core.waitingResponseSince();
    }

    public onOtherClientsGet(operation: TOperation, revisionTo: number): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this._history?.beforeOtherClientsGet(this, operation, revisionTo);
        this.core.onGet(operation, revisionTo, false);
        this._history?.afterOtherClientsGet(this);
    }

    public operateAsState(state: TState): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this._history?.operateAsState(this, state);
        this.core.operateAsState(state);
    }

    // このメソッドは「operateAsStateを使えばよい」と判断して一時削除していたが、Operationを書いて適用させたいという場面が少なくなく、必要なapply関数もStateManager内部で保持しているため復帰させた。
    public operate(operation: TOperation): void {
        const newState = this.params.apply({ state: this.uiState, operation });
        this.operateAsState(newState);
    }

    public post(): PostResult<TState, TOperation> | undefined {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this._history?.beforePost(this);
        const toPost = this.core.post();
        this._history?.beginPost(this, toPost);
        if (toPost === undefined) {
            return undefined;
        }
        let isOnPostedExecuted = false;
        const onPosted = (onPosted: OnPosted<TOperation>) => {
            if (isOnPostedExecuted) {
                return;
            }
            isOnPostedExecuted = true;
            switch (onPosted.isSuccess) {
                case true:
                    if (onPosted.isId) {
                        this._history?.beforeEndPostAsId(this, onPosted.requestId);
                        this.core.endPostAsId(onPosted.requestId);
                        this._history?.afterEndPostAsId(this);
                        return;
                    }
                    this._history?.beforeEndPostAsSuccess(
                        this,
                        onPosted.result,
                        onPosted.revisionTo
                    );
                    this.core.onGet(onPosted.result, onPosted.revisionTo, true);
                    this._history?.afterEndPostAsSuccess(this);
                    return;
                case false:
                    this._history?.beforeEndPostAsNotSuccess(this);
                    this.core.cancelPost();
                    this._history?.afterEndPostAsNotSuccess(this);
                    return;
                case null:
                    this._history?.endPostAsUnknown(this);
                    this._requiresReload = true;
                    return;
            }
        };
        return { ...toPost, onPosted };
    }

    public reload({ state, revision }: { state: TState; revision: number }): void {
        this.core = new StateManagerCore<TState, TOperation>({
            ...this.params,
            revision: revision,
            state,
        });
        this._requiresReload = false;
    }

    // コンストラクタでenableHistoryにtrueを渡したときにのみnon-undefinedとなる
    public get history() {
        return this._history?.history;
    }
}
