"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promiseQueue_1 = require("./promiseQueue");
const delay = (delayBy) => {
    return new Promise(next => {
        setTimeout(() => next(), delayBy);
    });
};
class ExpectPromiseQueueResult {
    constructor(promise) {
        this._value = undefined;
        promise
            .then(value => {
            this._value = value;
        })
            .catch(err => {
            throw err;
        });
    }
    get value() {
        return this._value;
    }
    expectNotResolved() {
        expect(this.value).toBeUndefined();
    }
    expectToBe(expected) {
        var _a, _b;
        expect((_a = this.value) === null || _a === void 0 ? void 0 : _a.type).toBe(promiseQueue_1.executed);
        if (((_b = this.value) === null || _b === void 0 ? void 0 : _b.type) !== promiseQueue_1.executed) {
            throw new Error('type guard');
        }
        expect(this.value.value).toBe(expected);
    }
}
const $expect = (promise) => {
    return new ExpectPromiseQueueResult(promise);
};
describe('promiseQueue', () => {
    it('tests sync*1', async () => {
        const queue = new promiseQueue_1.PromiseQueue({});
        const actual = $expect(queue.next(async () => 17));
        await delay(100);
        actual.expectToBe(17);
    });
    it('tests sync*2', async () => {
        const queue = new promiseQueue_1.PromiseQueue({});
        const actual1 = $expect(queue.next(async () => 1));
        const actual2 = $expect(queue.next(async () => 2));
        await delay(100);
        actual1.expectToBe(1);
        actual2.expectToBe(2);
    });
    it('tests simultaneous', async () => {
        const queue = new promiseQueue_1.PromiseQueue({});
        const actual1 = $expect(queue.next(async () => {
            await delay(1000);
            return 1;
        }));
        const actual2 = $expect(queue.next(async () => {
            await delay(1000);
            return 2;
        }));
        await delay(500);
        actual1.expectNotResolved();
        actual2.expectNotResolved();
        await delay(1000);
        actual1.expectToBe(1);
        actual2.expectNotResolved();
        await delay(1000);
        actual1.expectToBe(1);
        actual2.expectToBe(2);
    });
    it('tests serial', async () => {
        const queue = new promiseQueue_1.PromiseQueue({});
        const actual1 = $expect(queue.next(async () => {
            await delay(500);
            return 1;
        }));
        await delay(1000);
        actual1.expectToBe(1);
        const actual2 = $expect(queue.next(async () => {
            await delay(500);
            return 2;
        }));
        actual2.expectNotResolved();
        await delay(1000);
        actual2.expectToBe(2);
    });
});
