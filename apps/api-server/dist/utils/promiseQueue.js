'use strict';

var Rx = require('rxjs');
var uuid = require('uuid');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var Rx__namespace = /*#__PURE__*/_interopNamespaceDefault(Rx);

const executed = 'executed';
const timeout = 'timeout';
const queueLimitReached = 'queueLimitReached';
class PromiseQueue {
    constructor({ queueLimit }) {
        this._promises = new Rx.Subject();
        this._pendingPromises = new Set();
        this._queueLimit = queueLimit ?? null;
        this._result = this._promises.pipe(Rx__namespace.map(({ id, execute, timeout }) => {
            const rawObservable = new Rx.Observable(observer => {
                execute()
                    .then(result => observer.next({
                    id,
                    result: { type: executed, value: result, isError: false },
                }))
                    .catch(reason => observer.next({
                    id,
                    result: { type: executed, value: reason, isError: true },
                }))
                    .finally(() => {
                    this._pendingPromises.delete(id);
                    observer.complete();
                });
            });
            if (timeout == null) {
                return rawObservable;
            }
            const timeoutValue = {
                id,
                result: { type: 'timeout' },
            };
            return rawObservable.pipe(Rx__namespace.timeout({
                each: timeout,
                with: () => Rx.defer(() => {
                    this._pendingPromises.delete(id);
                    return Rx.of(timeoutValue);
                }),
            }));
        }), Rx__namespace.concatAll(), Rx__namespace.share());
        this._result.subscribe({
            next: () => undefined,
            error: reason => {
                throw reason;
            },
            complete: () => {
                throw new Error('PromiseQueue observable completed for an unknown reason.');
            },
        });
    }
    nextCore(execute, timeout) {
        if (this._queueLimit != null && this._queueLimit <= this._pendingPromises.size) {
            return Promise.resolve({ type: queueLimitReached });
        }
        const id = uuid.v4();
        this._pendingPromises.add(id);
        const result = new Promise((resolver, reject) => {
            this._result.pipe(Rx__namespace.first(x => x.id === id)).subscribe({
                next: r => {
                    switch (r.result.type) {
                        case executed:
                            if (r.result.isError) {
                                reject(r.result.value);
                                return;
                            }
                            resolver({ type: executed, value: r.result.value });
                            return;
                        case 'timeout':
                            resolver({ type: 'timeout' });
                            return;
                    }
                },
                error: () => reject(new Error('PromiseQueue observable has thrown an error for an unknown reason.')),
                complete: () => reject(new Error('PromiseQueue observable has completed for an unknown reason.')),
            });
        });
        this._promises.next({ id, execute, timeout });
        return result;
    }
    nextWithTimeout(execute, timeout) {
        return this.nextCore(execute, timeout);
    }
    async next(execute) {
        const result = await this.nextCore(execute, undefined);
        if (result.type === timeout) {
            throw new Error('not expected timeout. ObjectId collision?');
        }
        return result;
    }
}

exports.PromiseQueue = PromiseQueue;
exports.executed = executed;
exports.queueLimitReached = queueLimitReached;
exports.timeout = timeout;
//# sourceMappingURL=promiseQueue.js.map
