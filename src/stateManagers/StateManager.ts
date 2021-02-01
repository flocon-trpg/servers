import { appConsole } from '../utils/appConsole';
import { simpleId } from '../utils/generators';

export type Apply<TState, TOperation> = (params: {
    state: TState;
    operation: TOperation;
}) => TState;

export type Compose<TOperation> = (params: {
    first: TOperation;
    second: TOperation;
}) => TOperation;

export type Transform<TFirstOperation, TSecondOperation> = (params: {
    first: TFirstOperation;
    second: TSecondOperation;
}) => { firstPrime: TFirstOperation; secondPrime: TSecondOperation };

export type Diff<TState, TOperation> = (params: {
    prev: TState;
    next: TState;
}) => TOperation | undefined;

export type StateManagerParameters<TState, TGetOperation, TPostOperation> = {
    revision: number;
    state: TState;
    applyGetOperation: Apply<TState, TGetOperation>;
    applyPostOperation: Apply<TState, TPostOperation>;
    composePostOperation: Compose<TPostOperation>;
    transform: Transform<TGetOperation, TPostOperation>;
    diff: Diff<TState, TGetOperation>;
}

// StateManagerから、PostUnknownを受け取る機能とreloadを取り除いたもの。
class StateManagerCore<TState, TGetOperation, TPostOperation> {
    private _revision: number;
    private _actualState: TState;
    // operationは、transformの結果idになることもあり得るので、undefinedも代入可能にしている。
    // requestIdにはブラウザで生成したランダムな文字列を入れる。サーバーはこのrequestIdとともに結果を返すので、送信した値に対する応答かどうかをチェックできる。
    private _postingOperation: { operation: TPostOperation | undefined; postedAt: Date; requestId: string } | undefined;
    private _localOperation: TPostOperation | undefined;
    // apply(apply(_actualState, _postingOperation), _localOperation) の結果をキャッシュする。_actualStateか_postingOperationか_localOperationのいずれかが変化したらundefinedを代入してキャッシュを削除する。
    private _uiStateCache: TState | undefined;

    private readonly _pendingGetOperations = new Map<number, { operation: TGetOperation; isMine: boolean; addedAt: Date }>(); // keyはrevision。isMine===trueである要素は1個以下になるはず。

    public constructor(private readonly params: StateManagerParameters<TState, TGetOperation, TPostOperation>) {
        this._revision = params.revision;
        this._actualState = params.state;
    }

    // 現在時刻 - waitingResponseSince の値が数秒程度の場合は正常だが、古すぎる場合は通信に問題が生じた（もしくはコードにバグがある）可能性が高い。
    public waitingResponseSince(): Date | null {
        const dates: Date[] = [];
        if (this._postingOperation !== undefined) {
            dates.push(this._postingOperation.postedAt);
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
        return this._postingOperation !== undefined;
    }

    public get actualState() {
        return this._actualState;
    }

    public get uiState() {
        if (this._uiStateCache === undefined) {
            let uiState = this.actualState;
            const first = this._postingOperation?.operation;
            if (first !== undefined) {
                console.info('first !== undefined');
                uiState = this.params.applyPostOperation({ state: uiState, operation: first });
            }
            const second = this._localOperation;
            if (second !== undefined) {
                console.info('second !== undefined');
                console.log({ state: this.actualState, first, second });
                uiState = this.params.applyPostOperation({ state: uiState, operation: second });
            }
            this._uiStateCache = uiState;
        }
        return this._uiStateCache;
    }

    public get revision() {
        return this._revision;
    }

    public operate(operation: TPostOperation) {
        this._localOperation = this._localOperation === undefined ? operation : this.params.composePostOperation({ first: this._localOperation, second: operation });
        this._uiStateCache = undefined;
    }

    private tryApplyPendingGetOperations() {
        const toApply = this._pendingGetOperations.get(this._revision + 1);
        if (toApply === undefined) {
            return;
        }
        this._pendingGetOperations.delete(this._revision + 1);

        if (toApply.isMine) {
            /*                                   prev actualState
             *                                    /              \
             *            this._postingOperation /                \ toApply.operation
             *                                  /      diff        \
             *           (expected next actualState) ------------- next actualState
             *              /                                        /
             *             / this._localOperation                   / (xform)
             *            /                                        /
             *    prev uiState                              next uiState
             */

            const expectedActualState = this._postingOperation?.operation === undefined ?
                this._actualState :
                this.params.applyPostOperation({ state: this._actualState, operation: this._postingOperation.operation });
            this._actualState = this.params.applyGetOperation({ state: this._actualState, operation: toApply.operation });
            const diff = this.params.diff({ next: this._actualState, prev: expectedActualState });
            this._localOperation = (() => {
                if (this._localOperation === undefined) {
                    return undefined;
                }
                if (diff === undefined) {
                    return this._localOperation;
                }
                return this.params.transform({ first: diff, second: this._localOperation }).secondPrime;
            })();
            this._postingOperation = undefined;

            this._revision++;
            this._uiStateCache = undefined;
            this.tryApplyPendingGetOperations();
            return;
        }

        /*                       prev actualState
         *                           /        \
         *   this._postingOperation /          \ toApply.operation
         *                         /            \
         *         (expected posted state)    next actualState
         *                       / \ (xform)    /
         * this._localOperation /   ----       / next this._postingOperation
         *                     /        \     /
         *              prev uiState     --- (expected posted state')
         *                     \            /
         *              (xform) \          / next this._localOperation
         *                       \        /
         *                      next uiState
         */

        this._actualState = this.params.applyGetOperation({ state: this._actualState, operation: toApply.operation });
        const { postedStateDiff, nextPostingOperation } = (() => {
            if (this._postingOperation?.operation === undefined) {
                return { postedStateDiff: toApply.operation, nextPostingOperation: undefined };
            }
            const xform = this.params.transform({ first: toApply.operation, second: this._postingOperation.operation });
            return { postedStateDiff: xform.firstPrime, nextPostingOperation: xform.secondPrime };
        })();
        if (this._postingOperation !== undefined) {
            this._postingOperation = { ...this._postingOperation, operation: nextPostingOperation };
        }
        const nextLocalOperation = this._localOperation === undefined ? undefined : this.params.transform({ first: postedStateDiff, second: this._localOperation }).secondPrime;
        this._localOperation = nextLocalOperation;

        this._revision++;
        this._uiStateCache = undefined;
        this.tryApplyPendingGetOperations();
    }

    // isMine === true の場合、revisionToで対応関係がわかるため、requestIdは必要ない。
    public onGet(operation: TGetOperation, revisionTo: number, isMine: boolean) {
        if (!Number.isInteger(revisionTo)) {
            appConsole.warn(`${revisionTo} is not an integer. onGet is cancelled.`);
            return;
        }
        if (revisionTo <= this._revision) {
            appConsole.log(`revisionTo of GetOperation is ${revisionTo}, but state revision is already ${this._revision}`);
            return;
        }
        if (this._pendingGetOperations.has(revisionTo)) {
            appConsole.warn(`stateManagerCore.__pendingGetOperations already contains ${revisionTo}`);
        }
        this._pendingGetOperations.set(revisionTo, { operation, isMine, addedAt: new Date() });
        this.tryApplyPendingGetOperations();
    }

    public post(): { operationToPost: TPostOperation; actualState: TState; revision: number; requestId: string } | undefined {
        if (this.isPosting) {
            throw 'cannot execute post when isPosting === true';
        }
        if (this._localOperation === undefined) {
            return undefined;
        }
        const operationToPost = this._localOperation;
        const requestId = simpleId();
        this._postingOperation = { operation: this._localOperation, postedAt: new Date(), requestId };
        this._localOperation = undefined;
        return { operationToPost, actualState: this._actualState, revision: this._revision, requestId };
    }

    public endPostAsId(requestId: string): boolean {
        if (this._postingOperation === undefined) {
            return false;
        }
        if (this._postingOperation.requestId !== requestId) {
            return false;
        }
        if (this._postingOperation.operation === undefined) {
            this._postingOperation = undefined;
            return true;
        }
        if (this._localOperation === undefined) {
            this._postingOperation = undefined;
            this._uiStateCache = undefined;
            return true;
        }
        const nextState = this.params.applyPostOperation({ state: this.actualState, operation: this._postingOperation.operation });
        const diffBack = this.params.diff({ prev: nextState, next: this.actualState });
        if (diffBack === undefined) {
            this._postingOperation = undefined;
            this._uiStateCache = undefined;
            return true;
        }
        const transformedLocalOperation = this.params.transform({ first: diffBack, second: this._localOperation });
        this._postingOperation = undefined;
        this._localOperation = transformedLocalOperation.secondPrime;
        this._uiStateCache = undefined;
        return true;
    }

    public cancelPost(): boolean {
        if (this._postingOperation === undefined) {
            return false;
        }
        if (this._localOperation === undefined) {
            this._localOperation = this._postingOperation.operation;
            this._postingOperation = undefined;
            return true;
        }
        if (this._postingOperation.operation === undefined) {
            this._postingOperation = undefined;
            return true;
        }
        this._localOperation = this.params.composePostOperation({ first: this._postingOperation.operation, second: this._localOperation });
        this._postingOperation = undefined;
        return true;
    }
}

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
    isSuccess: false | null; // 確実に失敗したときはfalse、成功したか失敗したかわからないときはnull
}

export class StateManager<TState, TGetOperation, TPostOperation> {
    private core: StateManagerCore<TState, TGetOperation, TPostOperation>;
    private _requiresReload = false;

    public constructor(private readonly params: StateManagerParameters<TState, TGetOperation, TPostOperation>) {
        this.core = new StateManagerCore<TState, TGetOperation, TPostOperation>(params);
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

    public onOthersGet(operation: TGetOperation, revisionTo: number): void {
        if (this.requiresReload) {
            throw 'this.requiresReload === true';
        }

        this.core.onGet(operation, revisionTo, false);
    }

    public operate(operation: TPostOperation): void {
        if (this.requiresReload) {
            throw 'this.requiresReload === true';
        }

        this.core.operate(operation);
    }

    public post(): {
        operationToPost: TPostOperation;
        actualState: TState;
        revision: number;
        requestId: string;
        onPosted: (onPosted: OnPosted<TGetOperation>) => void;
    } | undefined {
        if (this.requiresReload) {
            throw 'this.requiresReload === true';
        }

        const toPost = this.core.post();
        if (toPost === undefined) {
            return undefined;
        }
        let isOnPostedExecuted = false;
        const onPosted = (onPosted: OnPosted<TGetOperation>) => {
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
        this.core = new StateManagerCore<TState, TGetOperation, TPostOperation>({ ...this.params, revision: revision, state });
        this._requiresReload = false;
    }
}