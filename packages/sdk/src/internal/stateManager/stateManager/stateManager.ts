import { loggerRef } from '@flocon-trpg/utils';
import { StateManagerCore } from './stateManagerCore';
import { StateManagerHistoryQueue } from './stateManagerHistoryQueue';
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

    public constructor(private readonly args: StateManagerParameters<TState, TOperation>) {
        this.core = new StateManagerCore<TState, TOperation>(args);
        this._history = args.enableHistory === true ? new StateManagerHistoryQueue() : undefined;
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

        loggerRef.debug({ operation, revisionTo }, 'StateManager.onOtherClientGet');
        this._history?.beforeOtherClientsGet(this, operation, revisionTo);
        this.core.onGet(operation, revisionTo, false);
        this._history?.afterOtherClientsGet(this);
    }

    public setUiState(state: TState): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        loggerRef.debug({ state }, 'StateManager.setUiState');
        this._history?.operateAsState(this, state);
        this.core.setUiState(state);
    }

    // このメソッドは「setUiStateを使えばよい」と判断して一時削除していたが、Operationを書いて適用させたいという場面が少なくなく、必要なapply関数もStateManager内部で保持しているため復帰させた。
    public setUiStateByApply(operation: TOperation): void {
        loggerRef.debug({ operation }, 'StateManager.setUiStateByApply');
        const newState = this.args.apply({ state: this.uiState, operation });
        loggerRef.debug({ newState }, 'StateManager.setUiStateByApply');
        this.setUiState(newState);
    }

    public post(): PostResult<TState, TOperation> | undefined {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this._history?.beforePost(this);
        const toPost = this.core.post();
        loggerRef.debug({ toPost }, 'StateManager.post begin');
        this._history?.beginPost(this, toPost);
        if (toPost === undefined) {
            loggerRef.debug('StateManager.post is finished because toPost is undefined.');
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
                        loggerRef.debug({ onPosted }, 'StateManager.post is completing as id');
                        this._history?.beforeEndPostAsId(this, onPosted.requestId);
                        this.core.endPostAsId(onPosted.requestId);
                        this._history?.afterEndPostAsId(this);
                        return;
                    }
                    loggerRef.debug({ onPosted }, 'StateManager.post is completing as non-id');
                    this._history?.beforeEndPostAsSuccess(
                        this,
                        onPosted.result,
                        onPosted.revisionTo
                    );
                    this.core.onGet(onPosted.result, onPosted.revisionTo, true);
                    this._history?.afterEndPostAsSuccess(this);
                    return;
                case false:
                    loggerRef.debug({ onPosted }, 'StateManager.post is completing as non-success');
                    this._history?.beforeEndPostAsNotSuccess(this);
                    this.core.cancelPost();
                    this._history?.afterEndPostAsNotSuccess(this);
                    return;
                case null:
                    loggerRef.debug(
                        { onPosted },
                        'StateManager.post is completing as unknown result'
                    );
                    this._history?.endPostAsUnknown(this);
                    this._requiresReload = true;
                    return;
            }
        };
        return { ...toPost, onPosted };
    }

    public reload({ state, revision }: { state: TState; revision: number }): void {
        this.core = new StateManagerCore<TState, TOperation>({
            ...this.args,
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
