'use strict';

var core = require('@flocon-trpg/core');
var rxjs = require('rxjs');
var result = require('@kizahasi/result');
var webServerUtils = require('@flocon-trpg/web-server-utils');
var utils = require('@flocon-trpg/utils');
var option = require('@kizahasi/option');

/** RxJS の `BehaviorSubject` と似たクラスです。ただし、error が流されないという点で異なります。 */
class BehaviorEvent {
    #source;
    constructor(value) {
        this.#source = new rxjs.BehaviorSubject(value);
    }
    next(value) {
        this.#source.next(value);
    }
    complete() {
        this.#source.complete();
    }
    subscribe(observer) {
        return this.#source.subscribe(observer);
    }
    getValue() {
        return this.#source.getValue();
    }
    get value() {
        return this.#source.value;
    }
    asObservable() {
        return this.#source.asObservable();
    }
    unsubscribe() {
        return this.#source.unsubscribe();
    }
}

/**
 * 現在の値の取得と、値の変更を監視できるクラスです。
 *
 * RxJS の `BehaviorSubject` を read-only にしたものと似たクラスです。ただし、error が流されないという点で異なります。 */
class ReadonlyBehaviorEvent {
    #source;
    constructor(source) {
        this.#source = source;
    }
    /**
     * 値の変更を購読します。
     *
     * subscribe した瞬間に現在の値が流されます。これは RxJS の `BehaviorSubject` の挙動と合わせるためです。
     */
    subscribe(observer) {
        return this.#source.subscribe(observer);
    }
    getValue() {
        return this.#source.getValue();
    }
    /** `getValue()` の alias です。 */
    get value() {
        return this.#source.value;
    }
    /** RxJS の `Observable` に変換します。 */
    asObservable() {
        return this.#source.asObservable();
    }
    static of(value) {
        const source = new BehaviorEvent(value);
        source.complete();
        return new ReadonlyBehaviorEvent(source);
    }
}

const fetching$2 = 'fetching';
const error$2 = 'error';
const ok = 'ok';
const resultError = 'resultError';
const GetMessagesQuery = 'GetMessagesQuery';
const GetRoomConnectionsQuery = 'GetRoomConnectionsQuery';
const GetRoomQuery = 'GetRoomQuery';
class GraphQLStatusEventEmitter {
    #status = new BehaviorEvent({
        GetMessagesQuery: { type: fetching$2 },
        GetRoomConnectionsQuery: { type: fetching$2 },
        GetRoomQuery: { type: fetching$2 },
        RoomEventSubscription: { type: ok },
        hasError: false,
    });
    next(update) {
        const oldValue = this.#status.getValue();
        const newValue = update(oldValue);
        this.#status.next({ ...newValue, hasError: hasError(newValue) });
    }
    toReadonlyBehaviorEvent() {
        return new ReadonlyBehaviorEvent(this.#status);
    }
}
const hasError = (source) => {
    return (source.GetMessagesQuery.type === error$2 ||
        source.GetRoomConnectionsQuery.type === error$2 ||
        source.GetRoomQuery.type === error$2 ||
        source.RoomEventSubscription.type === error$2);
};
class GraphQLClientWithStatus {
    source;
    roomId;
    #e = new GraphQLStatusEventEmitter();
    #readonlyStatus = this.#e.toReadonlyBehaviorEvent();
    #roomEventSubscription;
    constructor(source, roomId) {
        this.source = source;
        this.roomId = roomId;
        this.#roomEventSubscription = this.source.roomEventSubscription({ id: roomId }).pipe(rxjs.catchError(e => {
            this.#e.next(prevValue => ({
                ...prevValue,
                RoomEventSubscription: {
                    type: error$2,
                    error: { type: 'observableError', value: e },
                },
            }));
            return rxjs.EMPTY;
        }), rxjs.mergeMap(e => {
            if (e.isError) {
                this.#e.next(prevValue => ({
                    ...prevValue,
                    RoomEventSubscription: {
                        type: error$2,
                        error: { type: resultError, value: e.error },
                    },
                }));
                return rxjs.EMPTY;
            }
            return rxjs.of(e.value);
        }), rxjs.shareReplay({ windowTime: 10_000, refCount: true }));
    }
    // ブラウザなどで Promise uncaught エラーが出ないようにすべて catch している。
    #catchPromiseError(source, name) {
        return source
            .then(result$1 => {
            if (result$1.isError) {
                const promiseError = {
                    type: resultError,
                    value: result$1.error,
                };
                this.#e.next(oldValue => {
                    const newValue = { ...oldValue };
                    newValue[name] = {
                        type: error$2,
                        error: promiseError,
                    };
                    return newValue;
                });
                return result.Result.error(promiseError);
            }
            return result.Result.ok(result$1.value);
        })
            .catch(e => {
            const promiseError = {
                type: 'promiseError',
                value: e,
            };
            this.#e.next(oldValue => {
                const newValue = { ...oldValue };
                newValue[name] = {
                    type: error$2,
                    error: promiseError,
                };
                return newValue;
            });
            return result.Result.error(promiseError);
        });
    }
    getMessagesQuery() {
        return this.#catchPromiseError(this.source.getMessagesQuery({ roomId: this.roomId }), GetMessagesQuery);
    }
    getRoomConnectionsQuery() {
        return this.#catchPromiseError(this.source.getRoomConnectionsQuery({ roomId: this.roomId }), GetRoomConnectionsQuery);
    }
    getRoomQuery() {
        return this.#catchPromiseError(this.source.getRoomQuery({ id: this.roomId }), GetRoomQuery);
    }
    operateMutation(variables) {
        return this.source.operateMutation({ ...variables, id: this.roomId });
    }
    get roomEventSubscription() {
        return this.#roomEventSubscription;
    }
    updateWritingMessagesStatusMutation(variables) {
        return this.source.updateWritingMessagesStatusMutation({
            ...variables,
            roomId: this.roomId,
        });
    }
    get status() {
        return this.#readonlyStatus;
    }
}

class RoomConnectionsManager {
    #map = new Map();
    #event = new BehaviorEvent({ current: this.#map, diff: null });
    #invokeNext(diff) {
        this.#event.next({ current: new Map(this.#map), diff });
    }
    connect({ userUid, updatedAt }) {
        const value = this.#map.get(userUid);
        if (value == null || value.updatedAt < updatedAt) {
            this.#map.set(userUid, { isConnected: true, updatedAt: new Date(updatedAt) });
            this.#invokeNext({ type: 'connect', userUid });
            return;
        }
    }
    disconnect({ userUid, updatedAt }) {
        const value = this.#map.get(userUid);
        if (value == null || value.updatedAt < updatedAt) {
            this.#map.set(userUid, { isConnected: false, updatedAt: new Date(updatedAt) });
            this.#invokeNext({ type: 'disconnect', userUid });
            return;
        }
    }
    onQuery({ connectedUserUids, fetchedAt, }) {
        connectedUserUids.forEach(userUid => {
            const value = this.#map.get(userUid);
            if (value == null || value.updatedAt < fetchedAt) {
                this.#map.set(userUid, { updatedAt: fetchedAt, isConnected: true });
            }
        });
        this.#invokeNext(null);
    }
    toReadonlyBehaviorEvent() {
        return new ReadonlyBehaviorEvent(this.#event);
    }
}
const subscribeRoomConnections = ({ client, subscription, }) => {
    const manager = new RoomConnectionsManager();
    const subscriptionSubscription = subscription.subscribe({
        next: status => {
            const e = status.roomConnectionEvent;
            if (e == null) {
                return;
            }
            if (e.isConnected) {
                manager.connect({ userUid: e.userUid, updatedAt: new Date(e.updatedAt) });
                return;
            }
            manager.disconnect({ userUid: e.userUid, updatedAt: new Date(e.updatedAt) });
            return;
        },
    });
    const executeQuery = () => {
        client.getRoomConnectionsQuery().then(r => {
            const result = r.value?.result;
            if (result?.__typename !== 'GetRoomConnectionsSuccessResult') {
                return;
            }
            manager.onQuery({
                connectedUserUids: result.connectedUserUids,
                fetchedAt: new Date(result.fetchedAt),
            });
        });
    };
    return {
        value: manager.toReadonlyBehaviorEvent(),
        // RoomState が joined になってから Query を実行させたいので、executeQuery が実行されるまで Query は実行されないようにしている。
        executeQuery,
        unsubscribe: () => {
            subscriptionSubscription.unsubscribe();
        },
    };
};

const success = 'success';
const fetching$1 = 'fetching';
const error$1 = 'error';
const createRoomMessagesClient = ({ client, roomEventSubscription, }) => {
    const roomMessagesClient = new webServerUtils.RoomMessagesClient();
    const writableQueryStatus = new BehaviorEvent({
        type: fetching$1,
    });
    const executeQuery = () => {
        const setQueryStatus = (newValue) => {
            if (writableQueryStatus.getValue().type === error$1) {
                return;
            }
            writableQueryStatus.next(newValue);
        };
        client.getMessagesQuery().then(result => {
            if (result.isError) {
                setQueryStatus({
                    type: error$1,
                    error: { type: 'GraphQLError', error: result.error },
                });
                return;
            }
            if (result.value.result.__typename !== 'RoomMessages') {
                setQueryStatus({
                    type: error$1,
                    error: {
                        type: 'GetRoomMessagesFailureResult',
                        failureType: result.value.result.failureType,
                    },
                });
                return;
            }
            roomMessagesClient.onQuery(result.value.result);
            setQueryStatus({ type: success });
        });
    };
    const subscriptionSubscription = roomEventSubscription.subscribe({
        next: roomMessageEvent => {
            roomMessagesClient.onEvent(roomMessageEvent);
        },
    });
    let isUnsubscribed = false;
    return {
        value: {
            messages: roomMessagesClient.messages,
            queryStatus: new ReadonlyBehaviorEvent(writableQueryStatus),
            addCustomMessage: (message) => roomMessagesClient.addCustomMessage(message),
        },
        // RoomState が joined になってから Query を実行させたいので、executeQuery が実行されるまで Query は実行されないようにしている。
        executeQuery,
        unsubscribe: () => {
            subscriptionSubscription.unsubscribe();
            isUnsubscribed = true;
        },
        isUnsubscribed,
    };
};

class StateGetter {
    /**
     * クライアントから見た、API サーバーにおける最新の State。
     *
     * ただし、通信のラグなどの影響で、実際の最新の状態より少し古い可能性があります。
     */
    syncedState;
    _diff;
    // this._syncedStateにthis._postingState.operationをapplyした結果がstateになる。通常、this._postingState.operationをAPIサーバーに送信して、その応答を待つ形になる。
    // operationは、transformの結果idになることもあり得るので、undefinedも代入可能にしている。
    _postingState;
    _uiStateCore = option.Option.none();
    constructor({ syncedState, diff, }) {
        this.syncedState = syncedState;
        this._diff = diff;
    }
    /**
     * クライアントの画面に表示すべき State。
     */
    get uiState() {
        if (this._uiStateCore.isNone) {
            return this._postingState?.state ?? this.syncedState;
        }
        return this._uiStateCore.value;
    }
    setUiState(value) {
        this._uiStateCore = option.Option.some(value);
    }
    /** `uiState` を `syncedState` の状態に戻します。 */
    clearUiState() {
        this._uiStateCore = option.Option.none();
    }
    /** API サーバーに Operation の post を開始した時点の State。 */
    get postingState() {
        return this._postingState;
    }
    setPostingState(state, metadata) {
        this._postingState = {
            state,
            operation: this._diff({ prevState: this.syncedState, nextState: state }),
            metadata,
        };
    }
    clearPostingState() {
        this._postingState = undefined;
    }
    /**
     * まだpostしていないoperation。
     *
     * post中の場合は、post後にクライアント側でたまっているoperationを表します。post中でないときは、単にクライアント側でたまっているoperationを表します。
     */
    getLocalOperation() {
        if (this._uiStateCore.isNone) {
            return undefined;
        }
        const result = this._diff({
            prevState: this._postingState?.state ?? this.syncedState,
            nextState: this.uiState,
        });
        if (result == null) {
            this._uiStateCore = option.Option.none();
        }
        return result;
    }
}

// StateManagerから、PostUnknownを受け取る機能とreloadを取り除いたもの。
// ユーザーが行ったOperationを保持する際、composeしていく戦略ではなく、stateをapplyしていき、operationが欲しい場合はdiffをとるという戦略を取っている。理由の1つ目は、Recordで同一キーでremove→addされた場合、upOperationではcomposeできないので困るため。TwoWayOperationならばcomposeしても情報は失われないが、prevValueをミスなく設定する必要が出てくる。理由の2つ目は、useStateEditorではOperationではなくStateをセットしたいため、その際に便利だから。
class StateManagerCore {
    params;
    _revision;
    _stateGetter;
    _pendingGetOperations = new Map(); // keyはrevision。isByMyClient===trueである要素は1個以下になるはず。
    constructor(params) {
        this.params = params;
        this._revision = params.revision;
        this._stateGetter = new StateGetter({ syncedState: params.state, diff: params.diff });
    }
    // 現在時刻 - waitingResponseSince の値が数秒程度の場合は正常だが、古すぎる場合は通信に問題が生じた（もしくはコードにバグがある）可能性が高い。
    waitingResponseSince() {
        const dates = [];
        if (this._stateGetter.postingState !== undefined) {
            dates.push(this._stateGetter.postingState.metadata.postedAt);
        }
        this._pendingGetOperations.forEach(value => dates.push(value.addedAt));
        let result = null;
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
    get isPosting() {
        return this._stateGetter.postingState !== undefined;
    }
    get syncedState() {
        return this._stateGetter.syncedState;
    }
    get uiState() {
        return this._stateGetter.uiState;
    }
    get revision() {
        return this._revision;
    }
    setUiState(state) {
        this._stateGetter.setUiState(state);
    }
    tryApplyPendingGetOperations() {
        const toApply = this._pendingGetOperations.get(this._revision + 1);
        if (toApply === undefined) {
            return;
        }
        this._pendingGetOperations.delete(this._revision + 1);
        if (toApply.isByMyClient) {
            // see "by my client" page in ./transformation.drawio
            const prevSyncedState = this._stateGetter.syncedState;
            this._stateGetter.syncedState = this.params.apply({
                state: this._stateGetter.syncedState,
                operation: toApply.operation,
            });
            const localOperation = this._stateGetter.getLocalOperation();
            if (localOperation === undefined) {
                this._stateGetter.clearUiState();
            }
            else {
                let diff;
                if (this._stateGetter.postingState == null) {
                    diff = undefined;
                }
                else {
                    diff = this.params.diff({
                        prevState: this._stateGetter.postingState.state,
                        nextState: this._stateGetter.syncedState,
                    });
                }
                if (diff !== undefined) {
                    const xform = this.params.transform({
                        state: this._stateGetter.postingState?.state ?? prevSyncedState,
                        first: localOperation,
                        second: diff,
                    });
                    this._stateGetter.setUiState(this.params.apply({
                        state: this._stateGetter.syncedState,
                        operation: xform.firstPrime,
                    }));
                }
            }
            this._stateGetter.clearPostingState();
            this._revision++;
            this.tryApplyPendingGetOperations();
            return;
        }
        // see "not by my client" page in ./transformation.drawio
        const prevSyncedState = this._stateGetter.syncedState;
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
                state: prevSyncedState,
                first: toApply.operation,
                second: this._stateGetter.postingState.operation,
            });
            return {
                toApplyOperationPrime: xform.firstPrime,
                nextPostingOperation: xform.secondPrime,
            };
        })();
        if (this._stateGetter.postingState !== undefined) {
            this._stateGetter.setPostingState(nextPostingOperation == null
                ? this._stateGetter.syncedState
                : this.params.apply({
                    state: this._stateGetter.syncedState,
                    operation: nextPostingOperation,
                }), this._stateGetter.postingState.metadata);
        }
        const nextLocalOperation = prevLocalOperation === undefined
            ? undefined
            : this.params.transform({
                state: this._stateGetter.postingState?.state ?? prevSyncedState,
                first: toApplyOperationPrime,
                second: prevLocalOperation,
            }).firstPrime;
        if (nextLocalOperation !== undefined) {
            this._stateGetter.setUiState(this.params.apply({
                state: this._stateGetter.uiState,
                operation: nextLocalOperation,
            }));
        }
        else {
            this._stateGetter.clearUiState();
        }
        this._revision++;
        this.tryApplyPendingGetOperations();
    }
    // isByMyClient === true の場合、revisionToで対応関係がわかるため、requestIdは必要ない。
    onGet(operation, revisionTo, isByMyClient) {
        if (!Number.isInteger(revisionTo)) {
            utils.loggerRef.warn(`${revisionTo} is not an integer. onGet is cancelled.`);
            return;
        }
        if (revisionTo <= this._revision) {
            utils.loggerRef.info(`revisionTo of GetOperation is ${revisionTo}, but state revision is already ${this._revision}`);
            return;
        }
        if (this._pendingGetOperations.has(revisionTo)) {
            utils.loggerRef.warn(`stateManagerCore.__pendingGetOperations already contains ${revisionTo}`);
        }
        this._pendingGetOperations.set(revisionTo, {
            operation,
            isByMyClient,
            addedAt: new Date(),
        });
        this.tryApplyPendingGetOperations();
    }
    post() {
        if (this.isPosting) {
            throw new Error('cannot execute post when isPosting === true');
        }
        const localOperation = this._stateGetter.getLocalOperation();
        if (localOperation === undefined) {
            return undefined;
        }
        const requestId = core.simpleId();
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
    endPostAsId(requestId) {
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
    cancelPost() {
        if (this._stateGetter.postingState == null) {
            return false;
        }
        this._stateGetter.setUiState(this._stateGetter.uiState ?? this._stateGetter.postingState.state);
        this._stateGetter.clearPostingState();
        return true;
    }
}

const maxHistoryCount = 20;
class StateManagerHistoryQueue {
    _history = [];
    add(elem) {
        this._history.push(elem);
        if (this._history.length > maxHistoryCount) {
            this._history.shift();
        }
    }
    get history() {
        return this._history;
    }
    operateAsState(stateManager, state) {
        this.add({
            type: 'operate',
            revision: stateManager.revision,
            nextState: state,
        });
    }
    beforePost(stateManager) {
        this.add({
            type: 'beforePost',
            uiState: stateManager.uiState,
        });
    }
    beginPost(stateManager, value) {
        this.add({
            type: 'posting',
            uiState: stateManager.uiState,
            value,
        });
    }
    beforeEndPostAsId(stateManager, requestId) {
        this.add({
            type: 'beforeEndPostAsId',
            requestId,
            uiState: stateManager.uiState,
        });
    }
    afterEndPostAsId(stateManager) {
        this.add({
            type: 'afterEndPostAsId',
            uiState: stateManager.uiState,
        });
    }
    beforeEndPostAsSuccess(stateManager, operation, revisionTo) {
        this.add({
            type: 'beforeEndPostAsSuccess',
            uiState: stateManager.uiState,
            operation,
            revisionTo,
        });
    }
    afterEndPostAsSuccess(stateManager) {
        this.add({
            type: 'afterEndPostAsSuccess',
            uiState: stateManager.uiState,
        });
    }
    beforeOtherClientsGet(stateManager, operation, revisionTo) {
        this.add({
            type: 'beforeOtherClientsGet',
            uiState: stateManager.uiState,
            operation,
            revisionTo,
        });
    }
    afterOtherClientsGet(stateManager) {
        this.add({
            type: 'afterOtherClientsGet',
            uiState: stateManager.uiState,
        });
    }
    beforeEndPostAsNotSuccess(stateManager) {
        this.add({
            type: 'beforeEndPostAsNotSuccess',
            uiState: stateManager.uiState,
        });
    }
    afterEndPostAsNotSuccess(stateManager) {
        this.add({
            type: 'afterEndPostAsNotSuccess',
            uiState: stateManager.uiState,
        });
    }
    endPostAsUnknown(stateManager) {
        this.add({
            type: 'endPostAsUnknown',
            uiState: stateManager.uiState,
        });
    }
}

class StateManager {
    args;
    core;
    _requiresReload = false;
    _history;
    constructor(args) {
        this.args = args;
        this.core = new StateManagerCore(args);
        this._history = args.enableHistory === true ? new StateManagerHistoryQueue() : undefined;
    }
    get isPosting() {
        if (this.requiresReload) {
            return false;
        }
        return this.core.isPosting;
    }
    get uiState() {
        return this.core.uiState;
    }
    get revision() {
        return this.core.revision;
    }
    get requiresReload() {
        return this._requiresReload;
    }
    waitingResponseSince() {
        if (this.requiresReload) {
            return null;
        }
        return this.core.waitingResponseSince();
    }
    onOtherClientsGet(operation, revisionTo) {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }
        utils.loggerRef.debug({ operation, revisionTo }, 'StateManager.onOtherClientGet');
        this._history?.beforeOtherClientsGet(this, operation, revisionTo);
        this.core.onGet(operation, revisionTo, false);
        this._history?.afterOtherClientsGet(this);
    }
    setUiState(state) {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }
        utils.loggerRef.debug({ state }, 'StateManager.setUiState');
        this._history?.operateAsState(this, state);
        this.core.setUiState(state);
    }
    // このメソッドは「setUiStateを使えばよい」と判断して一時削除していたが、Operationを書いて適用させたいという場面が少なくなく、必要なapply関数もStateManager内部で保持しているため復帰させた。
    setUiStateByApply(operation) {
        utils.loggerRef.debug({ operation }, 'StateManager.setUiStateByApply');
        const newState = this.args.apply({ state: this.uiState, operation });
        utils.loggerRef.debug({ newState }, 'StateManager.setUiStateByApply');
        this.setUiState(newState);
    }
    post() {
        if (this.requiresReload) {
            throw new Error('this.requiresReload === true');
        }
        this._history?.beforePost(this);
        const toPost = this.core.post();
        utils.loggerRef.debug({ toPost }, 'StateManager.post begin');
        this._history?.beginPost(this, toPost);
        if (toPost === undefined) {
            utils.loggerRef.debug('StateManager.post is finished because toPost is undefined.');
            return undefined;
        }
        let isOnPostedExecuted = false;
        const onPosted = (onPosted) => {
            if (isOnPostedExecuted) {
                return;
            }
            isOnPostedExecuted = true;
            switch (onPosted.isSuccess) {
                case true:
                    if (onPosted.isId) {
                        utils.loggerRef.debug({ onPosted }, 'StateManager.post is completing as id');
                        this._history?.beforeEndPostAsId(this, onPosted.requestId);
                        this.core.endPostAsId(onPosted.requestId);
                        this._history?.afterEndPostAsId(this);
                        return;
                    }
                    utils.loggerRef.debug({ onPosted }, 'StateManager.post is completing as non-id');
                    this._history?.beforeEndPostAsSuccess(this, onPosted.result, onPosted.revisionTo);
                    this.core.onGet(onPosted.result, onPosted.revisionTo, true);
                    this._history?.afterEndPostAsSuccess(this);
                    return;
                case false:
                    utils.loggerRef.debug({ onPosted }, 'StateManager.post is completing as non-success');
                    this._history?.beforeEndPostAsNotSuccess(this);
                    this.core.cancelPost();
                    this._history?.afterEndPostAsNotSuccess(this);
                    return;
                case null:
                    utils.loggerRef.debug({ onPosted }, 'StateManager.post is completing as unknown result');
                    this._history?.endPostAsUnknown(this);
                    this._requiresReload = true;
                    return;
            }
        };
        return { ...toPost, onPosted };
    }
    reload({ state, revision }) {
        this.core = new StateManagerCore({
            ...this.args,
            revision: revision,
            state,
        });
        this._requiresReload = false;
    }
    // コンストラクタでenableHistoryにtrueを渡したときにのみnon-undefinedとなる
    get history() {
        return this._history?.history;
    }
}

const createParameters = (state, revision) => {
    return {
        state,
        revision,
        apply: params => {
            const result = core.apply(core.roomTemplate)(params);
            if (result.isError) {
                throw core.toOtError(result.error);
            }
            return result.value;
        },
        transform: params => {
            const result = core.clientTransform(core.roomTemplate)(params);
            if (result.isError) {
                throw core.toOtError(result.error);
            }
            return {
                firstPrime: result.value.firstPrime ?? { $v: 2, $r: 1 },
                secondPrime: result.value.secondPrime ?? { $v: 2, $r: 1 },
            };
        },
        diff: params => {
            const result = core.diff(core.roomTemplate)(params);
            return core.toUpOperation(core.roomTemplate)(result ?? { $v: 2, $r: 1 });
        },
        enableHistory: false,
    };
};
const create = (state, revision) => {
    return new StateManager(createParameters(state, revision));
};

var Room;
(function (Room) {
    Room.createState = (source) => {
        return core.parseState(source.stateJson);
    };
    Room.createGetOperation = (source) => {
        return core.parseUpOperation(source.valueJson);
    };
    Room.toGraphQLInput = (source, clientId) => {
        return {
            clientId,
            valueJson: core.stringifyUpOperation(source),
        };
    };
})(Room || (Room = {}));

const fetching = 'fetching';
const joined = 'joined';
const nonJoined = 'nonJoined';
const GetRoomFailure = 'GetRoomFailure';
const GraphQLError = 'GraphQLError';
const transformationError = 'transformationError';
const OperateRoomFailure = 'OperateRoomFailure';
const deleted = 'deleted';
const onChangedLocallySampleTime = 3000;
const error = 'error';
class RoomStateManager {
    #stateStream = new BehaviorEvent({
        type: fetching,
    });
    #roomStateManager = null;
    #mutationError = new BehaviorEvent(null);
    #readonlyMutationError = new ReadonlyBehaviorEvent(this.#mutationError);
    #unsubscribe;
    /** GetRoom query が完了する前に、Subscription で受け取った RoomOperation を保持する Map です。 */
    // キーはrevisionTo
    #roomOperationCache = new Map();
    /** `setState` もしくは `setStateByApply` が実行されたときにトリガーされます。 */
    #onStateChangedLocally = new rxjs.Subject();
    constructor({ client, subscription, userUid, clientId, }) {
        const onStateChangedSubscription = this.#subscribeOnStateChangedLocally({
            client,
            clientId,
        });
        const subscriptionSubscription = subscription.subscribe({
            next: event => {
                if (event.deleteRoomOperation != null) {
                    this.#setState({
                        type: deleted,
                        deletedBy: event.deleteRoomOperation.deletedBy,
                    });
                }
                if (event.roomOperation != null) {
                    const roomOperation = event.roomOperation;
                    if (this.#roomStateManager == null) {
                        this.#roomOperationCache.set(roomOperation.revisionTo, roomOperation);
                        return;
                    }
                    if (roomOperation.operatedBy?.userUid === userUid &&
                        roomOperation.operatedBy.clientId === clientId) {
                        // Roomは、他のクライアントが行った変更はSubscriptionの結果を用い、自分のクライアントが行った変更はMutationの結果を用いている。
                        return;
                    }
                    const operation = Room.createGetOperation(roomOperation);
                    this.#roomStateManager.onOtherClientsGet(operation, roomOperation.revisionTo);
                    this.#onRoomStateManagerUpdate();
                }
            },
            complete: () => {
                this.#stateStream.complete();
            },
        });
        this.#unsubscribe = () => {
            onStateChangedSubscription.unsubscribe();
            subscriptionSubscription.unsubscribe();
        };
        this.#executeGetRoomQuery({ client, userUid, clientId });
    }
    #setState(action) {
        const prevValue = this.stateStream.getValue();
        switch (prevValue.type) {
            case fetching:
            case joined:
                break;
            default:
                return;
        }
        const nextValue = typeof action === 'function' ? action(prevValue) : action;
        this.#stateStream.next(nextValue);
    }
    #onRoomStateManagerUpdate() {
        const $stateManager = this.#roomStateManager;
        if ($stateManager == null) {
            return;
        }
        this.#setState(oldValue => {
            if (oldValue.type !== joined) {
                return oldValue;
            }
            const newState = $stateManager.uiState;
            if ($stateManager.requiresReload) {
                return {
                    type: error,
                    state: newState,
                    setStateByApply: undefined,
                    setState: undefined,
                    error: {
                        type: transformationError,
                    },
                };
            }
            return {
                type: oldValue.type,
                state: newState,
                setStateByApply: oldValue.setStateByApply,
                setState: oldValue.setState,
            };
        });
    }
    #subscribeOnStateChangedLocally({ client, clientId, }) {
        return this.#onStateChangedLocally
            .pipe(rxjs.sampleTime(onChangedLocallySampleTime), rxjs.map(() => {
            const roomStateManager = this.#roomStateManager;
            if (roomStateManager == null) {
                return rxjs.EMPTY;
            }
            if (roomStateManager.isPosting || roomStateManager.requiresReload) {
                return rxjs.EMPTY;
            }
            const toPost = roomStateManager.post();
            if (toPost == null) {
                return rxjs.EMPTY;
            }
            const valueInput = Room.toGraphQLInput(toPost.operationToPost, clientId);
            return client
                .operateMutation({
                operation: valueInput,
                revisionFrom: toPost.revision,
                requestId: toPost.requestId,
            })
                .then(operationResult => ({
                type: 'then',
                operationResult,
                toPost,
                getRoomState: () => roomStateManager.uiState,
            }))
                .catch(e => ({
                type: 'catch',
                toPost,
                error: e,
            }));
        }), rxjs.mergeAll())
            .subscribe({
            next: result => {
                if (result.type === 'catch') {
                    this.#mutationError.next({ type: 'promiseError', value: result.error });
                    result.toPost.onPosted({ isSuccess: null });
                    return;
                }
                if (result.operationResult.isError) {
                    this.#mutationError.next({
                        type: 'resultError',
                        value: result.operationResult.error,
                    });
                    result.toPost.onPosted({ isSuccess: null });
                    return;
                }
                const { operationResult, toPost, getRoomState } = result;
                if (operationResult.isError) {
                    // TODO: isSuccess: falseのケースに対応（サーバー側の対応も必要か）
                    toPost.onPosted({ isSuccess: null });
                    return;
                }
                switch (operationResult.value.result.__typename) {
                    case 'OperateRoomSuccessResult':
                        toPost.onPosted({
                            isSuccess: true,
                            isId: false,
                            revisionTo: operationResult.value.result.operation.revisionTo,
                            result: Room.createGetOperation(operationResult.value.result.operation),
                        });
                        this.#onRoomStateManagerUpdate();
                        break;
                    case 'OperateRoomIdResult':
                        toPost.onPosted({
                            isSuccess: true,
                            isId: true,
                            requestId: operationResult.value.result.requestId,
                        });
                        this.#onRoomStateManagerUpdate();
                        break;
                    case 'OperateRoomNonJoinedResult':
                        this.#setState({
                            type: nonJoined,
                            state: getRoomState(),
                            nonJoinedRoom: operationResult.value.result.roomAsListItem,
                        });
                        break;
                    case 'OperateRoomFailureResult':
                        this.#setState({
                            type: error,
                            state: getRoomState(),
                            setState: undefined,
                            setStateByApply: undefined,
                            error: {
                                type: OperateRoomFailure,
                                error: operationResult.value.result.failureType,
                            },
                        });
                        break;
                }
            },
        });
    }
    #executeGetRoomQuery({ client, userUid, clientId, }) {
        client.getRoomQuery().then(q => {
            if (q.isError) {
                this.#setState({
                    type: error,
                    error: { type: GraphQLError, name: 'GetRoomQuery', error: q.error },
                });
                return;
            }
            const result = q.value.result;
            switch (result.__typename) {
                case 'GetJoinedRoomResult': {
                    const newRoomStateManager = create(Room.createState(result.room), result.room.revision);
                    this.#roomOperationCache.forEach((operation, revisionTo) => {
                        if (operation.operatedBy?.userUid !== userUid ||
                            operation.operatedBy.clientId !== clientId) {
                            newRoomStateManager.onOtherClientsGet(Room.createGetOperation(operation), revisionTo);
                        }
                    });
                    this.#roomOperationCache.clear(); // 早めのメモリ解放
                    this.#roomStateManager = newRoomStateManager;
                    const setStateCore = (operation) => {
                        const $stateManager = this.#roomStateManager;
                        if ($stateManager == null) {
                            return;
                        }
                        if ($stateManager.requiresReload) {
                            this.#setState(oldValue => {
                                if (oldValue.type !== joined) {
                                    return oldValue;
                                }
                                return {
                                    type: error,
                                    state: oldValue.state,
                                    setStateByApply: undefined,
                                    setState: undefined,
                                    error: {
                                        type: transformationError,
                                    },
                                };
                            });
                            return;
                        }
                        if (operation.type === 'state') {
                            $stateManager.setUiState(operation.state);
                        }
                        else {
                            $stateManager.setUiStateByApply(operation.operation);
                        }
                        this.#onRoomStateManagerUpdate();
                        this.#onStateChangedLocally.next();
                    };
                    if (newRoomStateManager.requiresReload) {
                        this.#setState({
                            type: error,
                            state: newRoomStateManager.uiState,
                            setStateByApply: undefined,
                            setState: undefined,
                            error: {
                                type: transformationError,
                            },
                        });
                    }
                    this.#setState({
                        type: joined,
                        state: newRoomStateManager.uiState,
                        setStateByApply: operation => setStateCore({ type: 'operation', operation }),
                        setState: setState => {
                            if (typeof setState === 'function') {
                                setStateCore({
                                    type: 'state',
                                    state: setState(newRoomStateManager.uiState),
                                });
                                return;
                            }
                            setStateCore({ type: 'state', state: setState });
                        },
                    });
                    break;
                }
                case 'GetNonJoinedRoomResult': {
                    this.#setState({
                        type: nonJoined,
                        state: null,
                        nonJoinedRoom: result.roomAsListItem,
                    });
                    break;
                }
                case 'GetRoomFailureResult': {
                    this.#setState({
                        type: error,
                        error: {
                            type: GetRoomFailure,
                            error: result.failureType,
                        },
                    });
                    break;
                }
            }
        });
    }
    #readonlyStateStream = new ReadonlyBehaviorEvent(this.#stateStream);
    get stateStream() {
        return this.#readonlyStateStream;
    }
    get mutationError() {
        return this.#readonlyMutationError;
    }
    #isUnsubscribed = false;
    get isUnsubscribed() {
        return this.#isUnsubscribed;
    }
    unsubscribe() {
        this.#unsubscribe();
        this.#isUnsubscribed = true;
    }
}

const subscribeWritingMessageStatus = ({ subscription, }) => {
    const map = new Map();
    const convertMap = (source) => {
        const result = new Map();
        source.forEach((value, key) => {
            result.set(key, value.current);
        });
        return result;
    };
    const result = new BehaviorEvent(convertMap(map));
    const subscriptionSubscription = subscription.subscribe({
        next: status => {
            if (status.writingMessageStatus == null) {
                return;
            }
            const prev = map.get(status.writingMessageStatus.userUid)?.current;
            map.set(status.writingMessageStatus.userUid, {
                prev,
                current: status.writingMessageStatus.status,
                __elapsed: 0,
            });
            result.next(convertMap(map));
        },
    });
    // 4～6秒間ほど変わらなかったら自動削除
    const autoDeleterSubscription = rxjs.interval(2000).subscribe(() => {
        [...map].forEach(([key, value]) => {
            if (value.__elapsed >= 4000) {
                map.delete(key);
                return;
            }
            value.__elapsed += 2000;
        });
        result.next(convertMap(map));
    });
    return {
        value: new ReadonlyBehaviorEvent(result),
        unsubscribe: () => {
            subscriptionSubscription.unsubscribe();
            autoDeleterSubscription.unsubscribe();
        },
    };
};

const bufferTimeValue = 1500;
const updateWritingMessageStatus = (client) => {
    const subject = new rxjs.Subject();
    const next = (inputType) => {
        subject.next(inputType);
    };
    const subscription = subject
        .pipe(rxjs.bufferTime(bufferTimeValue), rxjs.mergeMap(items => {
        const lastElement = items[items.length - 1];
        if (lastElement == null) {
            return [];
        }
        return client.updateWritingMessagesStatusMutation({ newStatus: lastElement });
    }))
        .subscribe();
    return { next, unsubscribe: () => subscription.unsubscribe() };
};

const createRoomClient = ({ client: clientSource, roomId, userUid, }) => {
    const client = new GraphQLClientWithStatus(clientSource, roomId);
    const clientId = core.simpleId();
    const roomStateManager = new RoomStateManager({
        client,
        subscription: client.roomEventSubscription.pipe(rxjs.mergeMap(e => (e.roomEvent == null ? [] : [e.roomEvent]))),
        clientId,
        userUid,
    });
    const createMessagesResult = createRoomMessagesClient({
        client,
        roomEventSubscription: client.roomEventSubscription.pipe(rxjs.mergeMap(e => e?.roomEvent?.roomMessageEvent == null ? [] : [e.roomEvent.roomMessageEvent])),
    });
    const writingMessageStatusResult = subscribeWritingMessageStatus({
        subscription: client.roomEventSubscription.pipe(rxjs.mergeMap(e => (e.roomEvent == null ? [] : [e.roomEvent]))),
    });
    const subscribeRoomConnectionsResult = subscribeRoomConnections({
        client,
        subscription: client.roomEventSubscription.pipe(rxjs.mergeMap(e => (e.roomEvent == null ? [] : [e.roomEvent]))),
    });
    const updateWritingMessageStatusResult = updateWritingMessageStatus(client);
    const roomJoinedSubscription = roomStateManager.stateStream
        .asObservable()
        .pipe(rxjs.filter(x => x.type === 'joined'), rxjs.take(1))
        .subscribe({
        next: () => {
            createMessagesResult.executeQuery();
            subscribeRoomConnectionsResult.executeQuery();
        },
    });
    return {
        /** メッセージの取得および変更の監視ができます。 */
        messages: createMessagesResult.value,
        /** 部屋に参加しているユーザーの接続状況を表します。キーは Firebase Authentication の userUid です。`isConnected` が false であるか、もしくは Map に含まれないユーザーは未接続を表します。 */
        roomConnections: subscribeRoomConnectionsResult.value,
        /** メッセージ、接続状況などを除いた部屋のオブジェクト(ボード、キャラなどが含まれます)を取得できます。 */
        roomState: roomStateManager.stateStream,
        /** メッセージを書き込み中のユーザー一覧の取得と、自分が書き込み中かどうかを示すステータスの更新を行えます。ステータスの更新は必ず行ってください。 */
        writingMessageStatus: {
            /** メッセージを書き込み中のユーザー一覧。 */
            value: writingMessageStatusResult.value,
            /** 実行することで、自分が書き込み中かどうかを示すステータスの更新を行えます。短時間で複数回実行された場合は、間引いてから API サーバーに送信されます。 */
            update: (inputType) => updateWritingMessageStatusResult.next(inputType),
        },
        /** `client` のいずれかがエラーを送信(`Promise` の場合は reject、`Observable` の場合は error)したかどうかを示します。エラーが送信された場合は再度 `createRoomClient` を実行することを推奨します。 */
        graphQLStatus: client.status,
        /** 内部で使用している `Observable` などの subscription を解除します。これを実行した場合、このオブジェクトの他のプロパティに存在する関数やプロパティにアクセスするとエラーが出ることがありますのでアクセスしないでください。 */
        unsubscribe: () => {
            roomStateManager.unsubscribe();
            createMessagesResult.unsubscribe();
            writingMessageStatusResult.unsubscribe();
            subscribeRoomConnectionsResult.unsubscribe();
            updateWritingMessageStatusResult.unsubscribe();
            roomJoinedSubscription.unsubscribe();
        },
    };
};

const createTestRoomClientSource = () => {
    const roomMessageClient = new webServerUtils.RoomMessagesClient();
    const queryStatus = new BehaviorEvent({
        type: 'fetching',
    });
    const roomState = new BehaviorEvent({ type: 'fetching' });
    const graphQLStatus = new GraphQLStatusEventEmitter();
    const roomConnections = new RoomConnectionsManager();
    const writingMessageStatusValue = new BehaviorEvent(new Map());
    return {
        roomMessageClient,
        queryStatus,
        roomState,
        clientStatus: graphQLStatus,
        roomConnections,
        writingMessageStatusValue,
    };
};
const createTestRoomClient = (callback) => {
    const source = createTestRoomClientSource();
    const roomClient = {
        messages: {
            messages: source.roomMessageClient.messages,
            addCustomMessage: notification => source.roomMessageClient.addCustomMessage(notification),
            queryStatus: new ReadonlyBehaviorEvent(source.queryStatus),
        },
        roomConnections: source.roomConnections.toReadonlyBehaviorEvent(),
        roomState: new ReadonlyBehaviorEvent(source.roomState),
        writingMessageStatus: {
            value: new ReadonlyBehaviorEvent(source.writingMessageStatusValue),
            update: inputType => callback.writingMessageStatus && callback.writingMessageStatus(inputType, source),
        },
        graphQLStatus: source.clientStatus.toReadonlyBehaviorEvent(),
        unsubscribe: () => callback.unsubscribe && callback.unsubscribe(source),
    };
    return {
        roomClient,
        source: {
            ...source,
            clientStatus: {
                next: (update) => source.clientStatus.next(update),
            },
        },
    };
};

exports.BehaviorEvent = BehaviorEvent;
exports.ReadonlyBehaviorEvent = ReadonlyBehaviorEvent;
exports.createRoomClient = createRoomClient;
exports.createTestRoomClient = createTestRoomClient;
//# sourceMappingURL=index.js.map
