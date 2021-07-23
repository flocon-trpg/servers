import { appConsole } from '../utils/appConsole';
import { simpleId } from '../utils/generators';

export type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => TState;

export type Compose<TState, TOperation> = (params: {
    state: TState;
    first: TOperation;
    second: TOperation;
}) => TOperation;

export type Transform<TFirstOperation, TSecondOperation> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => { firstPrime: TFirstOperation; secondPrime: TSecondOperation };

export type Diff<TState, TOperation> = (params: {
    prevState: TState;
    nextState: TState;
}) => TOperation | undefined;

export type StateManagerParameters<TState, TOperation> = {
    revision: number;
    state: TState;
    apply: Apply<TState, TOperation>;
    transform: Transform<TOperation, TOperation>;
    diff: Diff<TState, TOperation>;
};

// StateManagerから、PostUnknownを受け取る機能とreloadを取り除いたもの。
// ユーザーが行ったOperationを保持する際、composeしていく戦略ではなく、stateをapplyしていき、operationが欲しい場合はdiffをとるという戦略を取っている。理由の1つ目は、Recordで同一キーでremove→addされた場合、upOperationではcomposeできないので困るため。TwoWayOperationならばcomposeしても情報は失われないが、prevValueをミスなく設定する必要が出てくる。理由の2つ目は、useStateEditorではOperationではなくStateをセットしたいため、その際に便利だから。
class StateManagerCore<TState, TOperation> {
    private _revision: number;
    private _actualState: TState;
    // operationは、transformの結果idになることもあり得るので、undefinedも代入可能にしている。
    // requestIdにはブラウザで生成したランダムな文字列を入れる。サーバーはこのrequestIdとともに結果を返すので、送信した値に対する応答かどうかをチェックできる。
    private _postingState:
        | { operation: TOperation | undefined; state: TState; postedAt: Date; requestId: string }
        | undefined;
    // ブラウザに表示するstate。_actualStateか_postingState.stateと明らかに等しい場合はundefinedを代わりに代入する。
    private _uiStateCore: TState | undefined;

    private readonly _pendingGetOperations = new Map<
        number,
        { operation: TOperation; isByMyClient: boolean; addedAt: Date }
    >(); // keyはrevision。isByMyClient===trueである要素は1個以下になるはず。

    public constructor(private readonly params: StateManagerParameters<TState, TOperation>) {
        this._revision = params.revision;
        this._actualState = params.state;
    }

    // 現在時刻 - waitingResponseSince の値が数秒程度の場合は正常だが、古すぎる場合は通信に問題が生じた（もしくはコードにバグがある）可能性が高い。
    public waitingResponseSince(): Date | null {
        const dates: Date[] = [];
        if (this._postingState !== undefined) {
            dates.push(this._postingState.postedAt);
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
        return this._postingState !== undefined;
    }

    public get actualState() {
        return this._actualState;
    }

    public get uiState() {
        return this._uiStateCore ?? this._postingState?.state ?? this._actualState;
    }

    public get revision() {
        return this._revision;
    }

    // post中の場合は、post後にクライアント側でたまっているoperation。post中でないときは、単にクライアント側でたまっているoperation。
    public get localOperation(): TOperation | undefined {
        if (this._uiStateCore === undefined) {
            return undefined;
        }
        return this.params.diff({
            prevState: this._postingState?.state ?? this._actualState,
            nextState: this._uiStateCore,
        });
    }

    public operate(operation: TOperation) {
        this._uiStateCore = this.params.apply({
            state: this._uiStateCore ?? this._actualState,
            operation,
        });
    }

    public operateAsState(state: TState) {
        this._uiStateCore = state;
    }

    private tryApplyPendingGetOperations() {
        const toApply = this._pendingGetOperations.get(this._revision + 1);
        if (toApply === undefined) {
            return;
        }
        this._pendingGetOperations.delete(this._revision + 1);

        if (toApply.isByMyClient) {
            /*                                      prev actualState
             *                                          /        \
             *                                         /          \
             *                this._postingState.diff /            \ toApply.operation
             *                                       /              \
             *                                      /      diff      \
             *              this._postingState.state  ------------- next actualState
             *                        /                                  /
             *                       /                                  /
             *  this.localOperation /                                  / (xform)
             *                     /                                  /
             *                    /                                  /
             *              this._uiState                      next uiState
             */

            this._actualState = this.params.apply({
                state: this._actualState,
                operation: toApply.operation,
            });
            const diff = this.params.diff({
                prevState: this._postingState?.state ?? this._actualState,
                nextState: this._actualState,
            });
            const localOperation = this.localOperation;
            if (localOperation === undefined) {
                this._uiStateCore = undefined;
            } else {
                if (diff !== undefined) {
                    const xform = this.params.transform({ first: localOperation, second: diff });
                    this._uiStateCore = this.params.apply({
                        state: this._actualState,
                        operation: xform.firstPrime,
                    });
                }
            }
            this._postingState = undefined;

            this._revision++;
            this.tryApplyPendingGetOperations();
            return;
        }

        /*                    prev this._actualState
         *                            /        \
         *   this._postingState.diff /          \ toApply.operation
         *                          /            \
         *        this._postingState.state    next this._actualState
         *                       / \            /
         * this._localOperation /  (xform)     / next this._postingOperation.diff
         *                     /        \     /
         *        prev this._uiState     --- (expected posted state')
         *                     \            /
         *              (xform) \          / next this._localOperation
         *                       \        /
         *                  next this._uiState
         */

        const prevLocalOperation = this.localOperation;
        this._actualState = this.params.apply({
            state: this._actualState,
            operation: toApply.operation,
        });
        const { toApplyOperationPrime, nextPostingOperation } = (() => {
            if (this._postingState?.operation === undefined) {
                return {
                    toApplyOperationPrime: toApply.operation,
                    nextPostingOperation: undefined,
                };
            }
            const xform = this.params.transform({
                first: toApply.operation,
                second: this._postingState.operation,
            });
            return {
                toApplyOperationPrime: xform.firstPrime,
                nextPostingOperation: xform.secondPrime,
            };
        })();
        if (this._postingState !== undefined) {
            this._postingState = {
                ...this._postingState,
                state:
                    nextPostingOperation == null
                        ? this._actualState
                        : this.params.apply({
                              state: this._actualState,
                              operation: nextPostingOperation,
                          }),
                operation: nextPostingOperation,
            };
        }
        const nextLocalOperation =
            prevLocalOperation === undefined
                ? undefined
                : this.params.transform({
                      first: toApplyOperationPrime,
                      second: prevLocalOperation,
                  }).firstPrime;
        if (nextLocalOperation !== undefined) {
            this._uiStateCore = this.params.apply({
                state: this._uiStateCore ?? this._actualState,
                operation: nextLocalOperation,
            });
        } else {
            this._uiStateCore = undefined;
        }

        this._revision++;
        this.tryApplyPendingGetOperations();
    }

    //  === true の場合、revisionToで対応関係がわかるため、requestIdは必要ない。
    public onGet(operation: TOperation, revisionTo: number, isByMyClient: boolean) {
        if (!Number.isInteger(revisionTo)) {
            appConsole.warn(`${revisionTo} is not an integer. onGet is cancelled.`);
            return;
        }
        if (revisionTo <= this._revision) {
            appConsole.log(
                `revisionTo of GetOperation is ${revisionTo}, but state revision is already ${this._revision}`
            );
            return;
        }
        if (this._pendingGetOperations.has(revisionTo)) {
            appConsole.warn(
                `stateManagerCore.__pendingGetOperations already contains ${revisionTo}`
            );
        }
        this._pendingGetOperations.set(revisionTo, {
            operation,
            isByMyClient,
            addedAt: new Date(),
        });
        this.tryApplyPendingGetOperations();
    }

    public post():
        | { operationToPost: TOperation; actualState: TState; revision: number; requestId: string }
        | undefined {
        if (this.isPosting) {
            throw new Error('cannot execute post when isPosting === true');
        }
        if (this._uiStateCore === undefined) {
            return undefined;
        }
        const localOperation = this.localOperation;
        if (localOperation === undefined) {
            this._uiStateCore = undefined;
            return undefined;
        }
        const requestId = simpleId();
        this._postingState = {
            operation: localOperation,
            state: this._uiStateCore,
            postedAt: new Date(),
            requestId,
        };
        return {
            operationToPost: localOperation,
            actualState: this._actualState,
            revision: this._revision,
            requestId,
        };
    }

    public endPostAsId(requestId: string): boolean {
        if (this._postingState === undefined) {
            return false;
        }
        if (this._postingState.requestId !== requestId) {
            return false;
        }
        const localOperation = this.localOperation;
        if (localOperation === undefined) {
            this._postingState = undefined;
            this._uiStateCore = undefined;
            return true;
        }
        const undoOperation = this.params.diff({
            prevState: this._postingState.state,
            nextState: this._actualState,
        });
        if (undoOperation === undefined) {
            this._postingState = undefined;
            return true;
        }
        const newLocalOperation = this.params.transform({
            first: undoOperation,
            second: localOperation,
        }).secondPrime;
        this._uiStateCore = this.params.apply({
            state: this._postingState.state,
            operation: newLocalOperation,
        });
        this._postingState = undefined;
        return true;
    }

    public cancelPost(): boolean {
        if (this._postingState === undefined) {
            return false;
        }
        this._postingState = undefined;
        return true;
    }
}

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

export class StateManager<TState, TOperation> {
    private core: StateManagerCore<TState, TOperation>;
    private _requiresReload = false;

    public constructor(private readonly params: StateManagerParameters<TState, TOperation>) {
        this.core = new StateManagerCore<TState, TOperation>(params);
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

        this.core.onGet(operation, revisionTo, false);
    }

    public operate(operation: TOperation): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this.core.operate(operation);
    }

    public operateAsState(state: TState): void {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        this.core.operateAsState(state);
    }

    public post():
        | {
              operationToPost: TOperation;
              actualState: TState;
              revision: number;
              requestId: string;
              onPosted: (onPosted: OnPosted<TOperation>) => void;
          }
        | undefined {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }

        const toPost = this.core.post();
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
                        this.core.endPostAsId(onPosted.requestId);
                        return;
                    }
                    this.core.onGet(onPosted.result, onPosted.revisionTo, true);
                    return;
                case false:
                    this.core.cancelPost();
                    return;
                case null:
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
}

export type GetOnlyStateManagerParameters<TState, TOperation> = {
    revision: number;
    state: TState;
    apply: Apply<TState, TOperation>;
};

export class GetOnlyStateManager<TState, TOperation> {
    private readonly core: StateManager<TState, TOperation>;

    public constructor(private readonly params: GetOnlyStateManagerParameters<TState, TOperation>) {
        this.core = new StateManager<TState, TOperation>({
            ...params,
            transform: () => {
                throw new Error('transform should not be called');
            },
            diff: () => {
                throw new Error('diff should not be called');
            },
        });
    }

    public get uiState(): TState {
        return this.core.uiState;
    }

    public get revision(): number {
        return this.core.revision;
    }

    public reload({ state, revision }: { state: TState; revision: number }): void {
        this.reload({ state, revision });
    }

    public onGet(operation: TOperation, revisionTo: number): void {
        this.core.onOtherClientsGet(operation, revisionTo);
    }
}
