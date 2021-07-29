"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseQueue = exports.queueLimitReached = exports.timeout = exports.executed = void 0;
const rxjs_1 = require("rxjs");
const Rx = __importStar(require("rxjs/operators"));
const rxjs_2 = require("rxjs");
const uuid_1 = require("uuid");
exports.executed = 'executed';
exports.timeout = 'timeout';
exports.queueLimitReached = 'queueLimitReached';
class PromiseQueue {
    constructor({ queueLimit }) {
        this._promises = new rxjs_1.Subject();
        this._pendingPromises = new Set();
        this._result = this._promises.pipe(Rx.map(({ id, execute, timeout }) => {
            const rawObservable = new rxjs_1.Observable(observer => {
                if (queueLimit != null && queueLimit < this._pendingPromises.size) {
                    this._pendingPromises.delete(id);
                    observer.next({ id, result: { type: exports.queueLimitReached } });
                    observer.complete();
                    return;
                }
                execute()
                    .then(result => observer.next({
                    id,
                    result: { type: exports.executed, value: result, isError: false },
                }))
                    .catch(reason => observer.next({
                    id,
                    result: { type: exports.executed, value: reason, isError: true },
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
            return rawObservable.pipe(Rx.timeoutWith(timeout, rxjs_2.defer(() => {
                this._pendingPromises.delete(id);
                return rxjs_2.of(timeoutValue);
            })));
        }), Rx.concatAll(), Rx.publish(), Rx.refCount());
        this._result.subscribe(() => undefined, reason => {
            throw reason;
        }, () => {
            throw new Error('PromiseQueue observable completed for an unknown reason.');
        });
    }
    nextCore(execute, timeout) {
        const id = uuid_1.v4();
        this._pendingPromises.add(id);
        const result = new Promise((resolver, reject) => {
            this._result.pipe(Rx.first(x => x.id === id)).subscribe(r => {
                switch (r.result.type) {
                    case exports.executed:
                        if (r.result.isError) {
                            reject(r.result.value);
                            return;
                        }
                        resolver({ type: exports.executed, value: r.result.value });
                        return;
                    case 'timeout':
                        resolver({ type: 'timeout' });
                        return;
                }
            }, () => reject('PromiseQueue observable has thrown an error for an unknown reason.'), () => reject('PromiseQueue observable has completed for an unknown reason.'));
        });
        this._promises.next({ id, execute, timeout });
        return result;
    }
    nextWithTimeout(execute, timeout) {
        return this.nextCore(execute, timeout);
    }
    async next(execute) {
        const result = await this.nextCore(execute, undefined);
        if (result.type === exports.timeout) {
            throw new Error('not expected timeout. ObjectId collision?');
        }
        return result;
    }
}
exports.PromiseQueue = PromiseQueue;
