// StateManagerから、PostUnknownを受け取る機能とreloadを取り除いたもの。

import { simpleId } from '../simpleId';
import { StateGetter } from './stateGetter';
import { StateManagerParameters } from './types';

// requestIdにはその都度生成したランダムな文字列を入れる。サーバーはこのrequestIdとともに結果を返すので、送信した値に対する応答かどうかをチェックできる。
type Metadata = {
    postedAt: Date;
    requestId: string;
};

// ユーザーが行ったOperationを保持する際、composeしていく戦略ではなく、stateをapplyしていき、operationが欲しい場合はdiffをとるという戦略を取っている。理由の1つ目は、Recordで同一キーでremove→addされた場合、upOperationではcomposeできないので困るため。TwoWayOperationならばcomposeしても情報は失われないが、prevValueをミスなく設定する必要が出てくる。理由の2つ目は、useStateEditorではOperationではなくStateをセットしたいため、その際に便利だから。
export class StateManagerCore<TState, TOperation> {
    private _revision: number;

    private _stateGetter: StateGetter<TState, TOperation, Metadata>;

    private readonly _pendingGetOperations = new Map<
        number,
        { operation: TOperation; isByMyClient: boolean; addedAt: Date }
    >(); // keyはrevision。isByMyClient===trueである要素は1個以下になるはず。

    public constructor(private readonly params: StateManagerParameters<TState, TOperation>) {
        this._revision = params.revision;
        this._stateGetter = new StateGetter({ syncedState: params.state, diff: params.diff });
    }

    // 現在時刻 - waitingResponseSince の値が数秒程度の場合は正常だが、古すぎる場合は通信に問題が生じた（もしくはコードにバグがある）可能性が高い。
    public waitingResponseSince(): Date | null {
        const dates: Date[] = [];
        if (this._stateGetter.postingState !== undefined) {
            dates.push(this._stateGetter.postingState.metadata.postedAt);
        }
        this._pendingGetOperations.forEach(value => dates.push(value.addedAt));
        let result: Date | null = null;
        dates.forEach(date => {
            if (result == null) {
                result = date;
                return;
            }
            if (result < date) {
                result = date;
            }
        });
        return result;
    }

    public get isPosting() {
        return this._stateGetter.postingState !== undefined;
    }

    public get syncedState() {
        return this._stateGetter.syncedState;
    }

    public get uiState() {
        return this._stateGetter.uiState;
    }

    public get revision() {
        return this._revision;
    }

    public operateAsState(state: TState) {
        this._stateGetter.setUiState(state);
    }

    private tryApplyPendingGetOperations() {
        const toApply = this._pendingGetOperations.get(this._revision + 1);
        if (toApply === undefined) {
            return;
        }
        this._pendingGetOperations.delete(this._revision + 1);

        if (toApply.isByMyClient) {
            /*                                      prev syncedState
             *                                          /        \
             *                                         /          \
             *                this._postingState.diff /            \ toApply.operation
             *                                       /              \
             *                                      /      diff      \
             *              this._postingState.state  ------------- next syncedState
             *                        /                                  /
             *                       /                                  /
             *       localOperation /                                  / (xform)
             *                     /                                  /
             *                    /                                  /
             *              this._uiState                      next uiState
             */

            this._stateGetter.syncedState = this.params.apply({
                state: this._stateGetter.syncedState,
                operation: toApply.operation,
            });
            const localOperation = this._stateGetter.getLocalOperation();
            if (localOperation === undefined) {
                this._stateGetter.clearUiState();
            } else {
                let diff: TOperation | undefined;
                if (this._stateGetter.postingState == null) {
                    diff = undefined;
                } else {
                    diff = this.params.diff({
                        prevState: this._stateGetter.postingState.state,
                        nextState: this._stateGetter.syncedState,
                    });
                }
                if (diff !== undefined) {
                    const xform = this.params.transform({ first: localOperation, second: diff });
                    this._stateGetter.setUiState(
                        this.params.apply({
                            state: this._stateGetter.syncedState,
                            operation: xform.firstPrime,
                        })
                    );
                }
            }
            this._stateGetter.clearPostingState();

            this._revision++;
            this.tryApplyPendingGetOperations();
            return;
        }

        /*                    prev this._syncedState
         *                            /        \
         *   this._postingState.diff /          \ toApply.operation
         *                          /            \
         *        this._postingState.state    next this._syncedState
         *                       / \            /
         * this._localOperation /  (xform)     / next this._postingOperation.diff
         *                     /        \     /
         *        prev this._uiState     --- (expected posted state')
         *                     \            /
         *              (xform) \          / next this._localOperation
         *                       \        /
         *                  next this._uiState
         */

        const prevLocalOperation = this._stateGetter.getLocalOperation();
        this._stateGetter.syncedState = this.params.apply({
            state: this._stateGetter.syncedState,
            operation: toApply.operation,
        });
        const { toApplyOperationPrime, nextPostingOperation } = (() => {
            if (this._stateGetter.postingState?.operation === undefined) {
                return {
                    toApplyOperationPrime: toApply.operation,
                    nextPostingOperation: undefined,
                };
            }
            const xform = this.params.transform({
                first: toApply.operation,
                second: this._stateGetter.postingState.operation,
            });
            return {
                toApplyOperationPrime: xform.firstPrime,
                nextPostingOperation: xform.secondPrime,
            };
        })();
        if (this._stateGetter.postingState !== undefined) {
            this._stateGetter.setPostingState(
                nextPostingOperation == null
                    ? this._stateGetter.syncedState
                    : this.params.apply({
                          state: this._stateGetter.syncedState,
                          operation: nextPostingOperation,
                      }),
                this._stateGetter.postingState.metadata
            );
        }
        const nextLocalOperation =
            prevLocalOperation === undefined
                ? undefined
                : this.params.transform({
                      first: toApplyOperationPrime,
                      second: prevLocalOperation,
                  }).firstPrime;
        if (nextLocalOperation !== undefined) {
            this._stateGetter.setUiState(
                this.params.apply({
                    state: this._stateGetter.uiState,
                    operation: nextLocalOperation,
                })
            );
        } else {
            this._stateGetter.clearUiState();
        }

        this._revision++;
        this.tryApplyPendingGetOperations();
    }

    // isByMyClient === true の場合、revisionToで対応関係がわかるため、requestIdは必要ない。
    public onGet(operation: TOperation, revisionTo: number, isByMyClient: boolean) {
        if (!Number.isInteger(revisionTo)) {
            console.warn(`${revisionTo} is not an integer. onGet is cancelled.`);
            return;
        }
        if (revisionTo <= this._revision) {
            console.log(
                `revisionTo of GetOperation is ${revisionTo}, but state revision is already ${this._revision}`
            );
            return;
        }
        if (this._pendingGetOperations.has(revisionTo)) {
            console.warn(`stateManagerCore.__pendingGetOperations already contains ${revisionTo}`);
        }
        this._pendingGetOperations.set(revisionTo, {
            operation,
            isByMyClient,
            addedAt: new Date(),
        });
        this.tryApplyPendingGetOperations();
    }

    public post():
        | { operationToPost: TOperation; syncedState: TState; revision: number; requestId: string }
        | undefined {
        if (this.isPosting) {
            throw new Error('cannot execute post when isPosting === true');
        }
        const localOperation = this._stateGetter.getLocalOperation();
        if (localOperation === undefined) {
            return undefined;
        }
        const requestId = simpleId();
        this._stateGetter.setPostingState(this.uiState, {
            postedAt: new Date(),
            requestId,
        });
        this._stateGetter.clearUiState();
        return {
            operationToPost: localOperation,
            syncedState: this._stateGetter.syncedState,
            revision: this._revision,
            requestId,
        };
    }

    public endPostAsId(requestId: string): boolean {
        if (this._stateGetter.postingState === undefined) {
            return false;
        }
        if (this._stateGetter.postingState.metadata.requestId !== requestId) {
            return false;
        }
        const localOperation = this._stateGetter.getLocalOperation();
        if (localOperation === undefined) {
            this._stateGetter.clearPostingState();
            this._stateGetter.clearUiState();
            return true;
        }
        this._stateGetter.clearPostingState();
        return true;
    }

    public cancelPost(): boolean {
        if (this._stateGetter.postingState == null) {
            return false;
        }
        this._stateGetter.setUiState(
            this._stateGetter.uiState ?? this._stateGetter.postingState.state
        );
        this._stateGetter.clearPostingState();
        return true;
    }
}
