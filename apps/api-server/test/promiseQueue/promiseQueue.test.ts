import { delay } from '@flocon-trpg/utils';
import {
    PromiseQueue,
    PromiseQueueResultWithTimeout,
    executed,
    queueLimitReached,
    timeout,
} from '../../src/utils/promiseQueue';

class ExpectPromiseQueueResult<T> {
    private _value: PromiseQueueResultWithTimeout<T> | undefined = undefined;

    public constructor(promise: Promise<PromiseQueueResultWithTimeout<T>>) {
        promise
            .then(value => {
                this._value = value;
            })
            .catch(err => {
                throw err;
            });
    }

    public get value() {
        return this._value;
    }

    public expectNotResolved(): void {
        expect(this.value).toBeUndefined();
    }

    public expectToBe(expected: T): void {
        expect(this.value?.type).toBe(executed);
        if (this.value?.type !== executed) {
            throw new Error('type guard');
        }
        expect(this.value.value).toBe(expected);
    }

    public expectToBeTimeout(): void {
        expect(this.value?.type).toBe(timeout);
    }

    public expectToBeQueueLimitReached(): void {
        expect(this.value?.type).toBe(queueLimitReached);
    }

    public expectNotToBeQueueLimitReached(): void {
        expect(this.value?.type).not.toBe(queueLimitReached);
    }
}

const $expect = <T>(promise: Promise<PromiseQueueResultWithTimeout<T>>) => {
    return new ExpectPromiseQueueResult(promise);
};

describe('promiseQueue', () => {
    it('tests sync*1 (next)', async () => {
        const queue = new PromiseQueue({});
        const actual = $expect(queue.next(async () => 17));

        // 同期的に実行するとまだactual.valueはnullなので、少し待っている。できればこの行がなくてもテストに成功するのが理想
        await delay(100);

        actual.expectToBe(17);
    });

    it('tests sync*1 (nextWithTimeout)', async () => {
        const queue = new PromiseQueue({});
        const actual = $expect(queue.nextWithTimeout(async () => 17, 1000));

        // 同期的に実行するとまだactual.valueはnullなので、少し待っている。できればこの行がなくてもテストに成功するのが理想
        await delay(100);

        actual.expectToBe(17);
    });

    it('tests sync*2 (next)', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(queue.next(async () => 1));
        const actual2 = $expect(queue.next(async () => 2));

        // 同期的に実行するとまだactual.valueはnullなので、少し待っている。できればこの行がなくてもテストに成功するのが理想
        await delay(100);

        actual1.expectToBe(1);
        actual2.expectToBe(2);
    });

    it('tests sync*2 (nextWithTimeout)', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(queue.nextWithTimeout(async () => 1, 0));
        const actual2 = $expect(queue.nextWithTimeout(async () => 2, 0));

        // 同期的に実行するとまだactual.valueはnullなので、少し待っている。できればこの行がなくてもテストに成功するのが理想
        await delay(100);

        actual1.expectToBe(1);
        actual2.expectToBe(2);
    });

    it('tests simultaneous (next)', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.next(async () => {
                await delay(1000);
                return 1;
            }),
        );
        const actual2 = $expect(
            queue.next(async () => {
                await delay(1000);
                return 2;
            }),
        );

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

    it('tests simultaneous (nextWithTimeout)', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(1000);
                return 1;
            }, 2000),
        );
        const actual2 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(1000);
                return 2;
            }, 2000),
        );

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

    it('tests simultaneous with timeout', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(2000);
                return 1;
            }, 1000),
        );
        const actual2 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(1000);
                return 2;
            }, 2000),
        );

        await delay(500);
        actual1.expectNotResolved();
        actual2.expectNotResolved();

        await delay(1000);
        actual1.expectToBeTimeout();
        actual2.expectNotResolved();

        await delay(1000);
        actual1.expectToBeTimeout();
        actual2.expectToBe(2);
    });

    it('tests serial (next)', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.next(async () => {
                await delay(500);
                return 1;
            }),
        );

        await delay(1000);

        actual1.expectToBe(1);

        const actual2 = $expect(
            queue.next(async () => {
                await delay(500);
                return 2;
            }),
        );

        actual2.expectNotResolved();

        await delay(1000);

        actual2.expectToBe(2);
    });

    it('tests serial (nextWithTimeout)', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(500);
                return 1;
            }, 1000),
        );

        await delay(1000);

        actual1.expectToBe(1);

        const actual2 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(500);
                return 2;
            }, 1000),
        );

        actual2.expectNotResolved();

        await delay(1000);

        actual2.expectToBe(2);
    });

    it('tests serial with timeout', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(1000);
                return 1;
            }, 500),
        );

        await delay(1000);

        actual1.expectToBeTimeout();

        const actual2 = $expect(
            queue.nextWithTimeout(async () => {
                await delay(500);
                return 2;
            }, 1000),
        );

        actual2.expectNotResolved();

        await delay(1000);

        actual2.expectToBe(2);
    });

    it('tests queueLimit', async () => {
        const queue = new PromiseQueue({ queueLimit: 2 });
        void queue.next(async () => {
            await delay(500);
            return 1;
        });
        const actual2 = $expect(
            queue.next(async () => {
                await delay(1500);
                return 2;
            }),
        );
        const actual3 = $expect(
            queue.next(async () => {
                await delay(500);
                return 3;
            }),
        );

        await delay(100);

        actual2.expectNotToBeQueueLimitReached();
        actual3.expectToBeQueueLimitReached();

        await delay(900);

        const actual4 = $expect(
            queue.next(async () => {
                await delay(500);
                return 4;
            }),
        );

        await delay(100);

        actual4.expectNotToBeQueueLimitReached();
    });
});
