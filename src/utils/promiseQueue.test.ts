import { executed, PromiseQueue, PromiseQueueResult } from './promiseQueue';

const delay = (delayBy: number) => {
    return new Promise<void>(next => {
        setTimeout(() => next(), delayBy);
    });
};

class ExpectPromiseQueueResult<T> {
    private _value: PromiseQueueResult<T> | undefined = undefined;

    public constructor(promise: Promise<PromiseQueueResult<T>>) {
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
}

const $expect = <T>(promise: Promise<PromiseQueueResult<T>>) => {
    return new ExpectPromiseQueueResult(promise);
};

describe('promiseQueue', () => {
    it('tests sync*1', async () => {
        const queue = new PromiseQueue({});
        const actual = $expect(queue.next(async () => 17));

        // 同期的に実行するとまだactual.valueはnullなので、少し待っている。できればこの行がなくてもテストに成功するのが理想
        await delay(100);

        actual.expectToBe(17);
    });

    it('tests sync*2', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(queue.next(async () => 1));
        const actual2 = $expect(queue.next(async () => 2));

        // 同期的に実行するとまだactual.valueはnullなので、少し待っている。できればこの行がなくてもテストに成功するのが理想
        await delay(100);

        actual1.expectToBe(1);
        actual2.expectToBe(2);
    });

    it('tests simultaneous', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.next(async () => {
                await delay(1000);
                return 1;
            })
        );
        const actual2 = $expect(
            queue.next(async () => {
                await delay(1000);
                return 2;
            })
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

    it('tests serial', async () => {
        const queue = new PromiseQueue({});
        const actual1 = $expect(
            queue.next(async () => {
                await delay(500);
                return 1;
            })
        );

        await delay(1000);

        actual1.expectToBe(1);

        const actual2 = $expect(
            queue.next(async () => {
                await delay(500);
                return 2;
            })
        );

        actual2.expectNotResolved();

        await delay(1000);

        actual2.expectToBe(2);
    });
});
