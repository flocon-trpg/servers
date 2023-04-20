import { Result } from '@kizahasi/result';
import {
    apply,
    applyBack,
    clientTransform,
    composeDownOperation,
    diff,
    restore,
    serverTransform,
    toClientState,
} from './recordOperation';
import { replace, update } from './recordOperationElement';

const notToBeCalled = () => {
    throw new Error('This function is not to be called.');
};

const createRecord = (length: number) => {
    const result: Record<string, string> = {};
    for (let i = 0; i < length; i++) {
        result[`key${i}`] = `value${i}`;
    }
    return result;
};

describe('recordOperation.toClientState', () => {
    it('tests undefined', () => {
        const notToBeCalled = jest.fn();
        const actual = toClientState({
            serverState: undefined,
            isPrivate: notToBeCalled,
            toClientState: notToBeCalled,
        });
        expect(notToBeCalled).not.toBeCalled();
        expect(actual ?? {}).toEqual({});
    });

    it('tests {}', () => {
        const notToBeCalled = jest.fn();
        const actual = toClientState({
            serverState: {},
            isPrivate: notToBeCalled,
            toClientState: notToBeCalled,
        });
        expect(notToBeCalled).not.toBeCalled();
        expect(actual).toEqual({});
    });

    it('tests non-empty state', () => {
        const actual = toClientState({
            serverState: { key1: 1, privateKey: 2, key2: 'privateValue', key3: 3 },
            isPrivate: (state, key) => {
                return key === 'privateKey' || state === 'privateValue';
            },
            toClientState: ({ key, state }) => key + '_' + state,
        });
        expect(actual).toEqual({ key1: 'key1_1', key3: 'key3_3' });
    });
});

describe('recordOperation.restore', () => {
    it.each([undefined, {}])('tests empty downOperation', downOperation => {
        const state = {
            a: 1,
            b: 2,
        };
        const notToBeCalled = jest.fn();
        const actual = restore({
            nextState: state,
            downOperation,
            innerDiff: notToBeCalled,
            innerRestore: notToBeCalled,
        });
        expect(notToBeCalled).not.toBeCalled();
        expect(actual.value?.prevState).toEqual(state);
        expect(actual.value?.twoWayOperation).toBeUndefined();
    });

    it('tests update', () => {
        const notToBeCalled = jest.fn();
        const innerRestore = jest.fn(() => {
            return Result.ok({ prevState: 1, twoWayOperation: '1,10' });
        });
        const actual = restore({
            nextState: { one: 10, two: 20 },
            downOperation: { one: { type: update, update: 1 } },
            innerDiff: notToBeCalled,
            innerRestore,
        });
        expect(notToBeCalled).not.toBeCalled();
        expect(innerRestore).toHaveBeenCalledTimes(1);
        expect(innerRestore.mock.lastCall).toEqual([
            { key: 'one', nextState: 10, downOperation: 1 },
        ]);
        expect(actual.value?.prevState).toEqual({ one: 1, two: 20 });
        expect(actual.value?.twoWayOperation).toEqual({ one: { type: update, update: '1,10' } });
    });

    it('tests update(not exist)', () => {
        const notToBeCalled = jest.fn();
        const actual = restore({
            nextState: { one: 10 },
            downOperation: { two: { type: update, update: 1 } },
            innerDiff: notToBeCalled,
            innerRestore: notToBeCalled,
        });
        expect(actual.isError).toBe(true);
        expect(notToBeCalled).not.toBeCalled();
    });

    it('tests replace as update', () => {
        const notToBeCalled = jest.fn();
        const innerDiff = jest.fn(() => {
            return '1,10';
        });
        const actual = restore({
            nextState: { one: 10, two: 20 },
            downOperation: { one: { type: replace, replace: { oldValue: 1 } } },
            innerDiff,
            innerRestore: notToBeCalled,
        });
        expect(notToBeCalled).not.toBeCalled();
        expect(innerDiff).toHaveBeenCalledTimes(1);
        expect(innerDiff.mock.lastCall).toEqual([{ key: 'one', prevState: 1, nextState: 10 }]);
        expect(actual.value?.prevState).toEqual({ one: 1, two: 20 });
        expect(actual.value?.twoWayOperation).toEqual({ one: { type: update, update: '1,10' } });
    });

    it('tests replace as add', () => {
        const notToBeCalled = jest.fn();
        const actual = restore({
            nextState: { one: 1, two: 2 },
            downOperation: { two: { type: replace, replace: { oldValue: undefined } } },
            innerDiff: notToBeCalled,
            innerRestore: notToBeCalled,
        });
        const expected: ReturnType<typeof restore> = Result.ok({
            prevState: { one: 1 },
            twoWayOperation: {
                two: { type: replace, replace: { oldValue: undefined, newValue: 2 } },
            },
        });
        expect(actual).toEqual(expected);
        expect(notToBeCalled).not.toBeCalled();
    });

    it('tests replace as delete', () => {
        const notToBeCalled = jest.fn();
        const actual = restore({
            nextState: { one: 1 },
            downOperation: { two: { type: replace, replace: { oldValue: 2 } } },
            innerDiff: notToBeCalled,
            innerRestore: notToBeCalled,
        });
        const expected: ReturnType<typeof restore> = Result.ok({
            prevState: { one: 1, two: 2 },
            twoWayOperation: {
                two: { type: replace, replace: { oldValue: 2, newValue: undefined } },
            },
        });
        expect(actual).toEqual(expected);
        expect(notToBeCalled).not.toBeCalled();
    });
});

describe('recordOperation.apply', () => {
    it.each([undefined, {}])('tests empty operation', operation => {
        const innerApply = jest.fn();
        const state = { one: 1 };
        const actual = apply({ prevState: state, operation, innerApply });
        expect(actual).toEqual(Result.ok(state));
    });

    it('tests update as success', () => {
        const innerApply = jest.fn(() => {
            return Result.ok(10);
        });
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { one: { type: update, update: '1,10' } },
            innerApply,
        });
        expect(actual).toEqual(Result.ok({ one: 10, two: 2 }));
        expect(innerApply).toHaveBeenCalledTimes(1);
        expect(innerApply.mock.lastCall).toEqual([{ key: 'one', prevState: 1, operation: '1,10' }]);
    });

    it('tests update to return error at innerApply', () => {
        const innerApply = jest.fn(() => {
            return Result.error('test error');
        });
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { one: { type: update, update: '1,10' } },
            innerApply,
        });
        expect(actual).toEqual(Result.error('test error'));
        expect(innerApply).toHaveBeenCalledTimes(1);
        expect(innerApply.mock.lastCall).toEqual([{ key: 'one', prevState: 1, operation: '1,10' }]);
    });

    it('tests update (not found)', () => {
        const innerApply = jest.fn();
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { three: { type: update, update: '3,30' } },
            innerApply,
        });
        expect(actual.isError).toBe(true);
        expect(innerApply).not.toBeCalled();
    });

    it('tests replace as add', () => {
        const innerApply = jest.fn();
        const actual = apply({
            prevState: { two: 2 },
            operation: { one: { type: replace, replace: { newValue: 1 } } },
            innerApply,
        });
        expect(actual).toEqual(Result.ok({ one: 1, two: 2 }));
        expect(innerApply).not.toBeCalled();
    });

    it('tests replace as add(duplicate)', () => {
        const innerApply = jest.fn();
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { one: { type: replace, replace: { newValue: 10 } } },
            innerApply,
        });
        expect(actual).toEqual(Result.ok({ one: 10, two: 2 }));
        expect(innerApply).not.toBeCalled();
    });

    it('tests replace as remove', () => {
        const innerApply = jest.fn();
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { one: { type: replace, replace: { newValue: undefined } } },
            innerApply,
        });
        expect(actual).toEqual(Result.ok({ two: 2 }));
        expect(innerApply).not.toBeCalled();
    });

    it('tests replace as remove(not found)', () => {
        const innerApply = jest.fn();
        const actual = apply({
            prevState: { two: 2 },
            operation: { one: { type: replace, replace: { newValue: undefined } } },
            innerApply,
        });
        expect(actual).toEqual(Result.ok({ two: 2 }));
        expect(innerApply).not.toBeCalled();
    });
});

describe('recordOperation.applyBack', () => {
    it.each([undefined, {}])('tests empty operation', operation => {
        const innerApplyBack = jest.fn();
        const state = { one: 1 };
        const actual = applyBack({ nextState: state, operation, innerApplyBack });
        expect(actual).toEqual(Result.ok(state));
    });

    it('tests update as success', () => {
        const innerApplyBack = jest.fn(() => {
            return Result.ok(10);
        });
        const actual = applyBack({
            nextState: { one: 1, two: 2 },
            operation: { one: { type: update, update: '1,10' } },
            innerApplyBack,
        });
        expect(actual).toEqual(Result.ok({ one: 10, two: 2 }));
        expect(innerApplyBack).toHaveBeenCalledTimes(1);
        expect(innerApplyBack.mock.lastCall).toEqual([{ key: 'one', state: 1, operation: '1,10' }]);
    });

    it('tests update to return error at innerApplyBack', () => {
        const innerApplyBack = jest.fn(() => {
            return Result.error('test error');
        });
        const actual = applyBack({
            nextState: { one: 1, two: 2 },
            operation: { one: { type: update, update: '1,10' } },
            innerApplyBack,
        });
        expect(actual).toEqual(Result.error('test error'));
        expect(innerApplyBack).toHaveBeenCalledTimes(1);
        expect(innerApplyBack.mock.lastCall).toEqual([{ key: 'one', state: 1, operation: '1,10' }]);
    });

    it('tests update (not found)', () => {
        const innerApplyBack = jest.fn();
        const actual = applyBack({
            nextState: { one: 1, two: 2 },
            operation: { three: { type: update, update: '3,30' } },
            innerApplyBack,
        });
        expect(actual.isError).toBe(true);
        expect(innerApplyBack).not.toBeCalled();
    });

    it('tests replace as add', () => {
        const innerApplyBack = jest.fn();
        const actual = applyBack({
            nextState: { two: 2 },
            operation: { one: { type: replace, replace: { oldValue: 1 } } },
            innerApplyBack,
        });
        expect(actual).toEqual(Result.ok({ one: 1, two: 2 }));
        expect(innerApplyBack).not.toBeCalled();
    });

    it('tests replace as add(duplicate)', () => {
        const innerApplyBack = jest.fn();
        const actual = applyBack({
            nextState: { one: 1, two: 2 },
            operation: { one: { type: replace, replace: { oldValue: 10 } } },
            innerApplyBack,
        });
        expect(actual).toEqual(Result.ok({ one: 10, two: 2 }));
        expect(innerApplyBack).not.toBeCalled();
    });

    it('tests replace as remove', () => {
        const innerApplyBack = jest.fn();
        const actual = applyBack({
            nextState: { one: 1, two: 2 },
            operation: { one: { type: replace, replace: { oldValue: undefined } } },
            innerApplyBack,
        });
        expect(actual).toEqual(Result.ok({ two: 2 }));
        expect(innerApplyBack).not.toBeCalled();
    });

    it('tests replace as remove(not found)', () => {
        const innerApplyBack = jest.fn();
        const actual = applyBack({
            nextState: { two: 2 },
            operation: { one: { type: replace, replace: { oldValue: undefined } } },
            innerApplyBack,
        });
        expect(actual).toEqual(Result.ok({ two: 2 }));
        expect(innerApplyBack).not.toBeCalled();
    });
});

describe('recordOperation.composeDownOperation', () => {
    it.each([
        { first: undefined, second: undefined },
        {
            first: {},
            second: undefined,
        },
        {
            first: undefined,
            second: {},
        },
        {
            first: {},
            second: {},
        },
    ])('tests %j', ({ first, second }) => {
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(Result.ok(undefined));
        expect(innerApplyBack).not.toBeCalled();
        expect(innerCompose).not.toBeCalled();
    });

    it.each([undefined, {}])('tests first=%p and second=non_empty', first => {
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            one: { type: replace, replace: { oldValue: 1 } },
            two: { type: update, update: 2 },
        };
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(Result.ok(second));
        expect(innerApplyBack).not.toBeCalled();
        expect(innerCompose).not.toBeCalled();
    });

    it.each([undefined, {}])('tests first=non_empty and second=%p', second => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            one: { type: replace, replace: { oldValue: 1 } },
            two: { type: update, update: 2 },
        };
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(Result.ok(first));
        expect(innerApplyBack).not.toBeCalled();
        expect(innerCompose).not.toBeCalled();
    });

    it('tests update->update', () => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            oneThenTen: { type: update, update: 1 },
            two: { type: update, update: 2 },
        };
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            oneThenTen: { type: update, update: 10 },
            three: { type: update, update: 3 },
        };
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn(() => {
            return Result.ok(11);
        });
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(
            Result.ok({
                oneThenTen: { type: update, update: 11 },
                two: { type: update, update: 2 },
                three: { type: update, update: 3 },
            })
        );
        expect(innerApplyBack).not.toBeCalled();
        expect(innerCompose).toHaveBeenCalledTimes(1);
        expect(innerCompose.mock.lastCall).toEqual([{ key: 'oneThenTen', first: 1, second: 10 }]);
    });

    it('tests innerCompose to return error', () => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            oneThenTen: { type: update, update: 1 },
            two: { type: update, update: 2 },
        };
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            oneThenTen: { type: update, update: 10 },
            three: { type: update, update: 3 },
        };
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn(() => {
            return Result.error('test error');
        });
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual.isError).toBe(true);
    });

    it('tests replace->update', () => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            oneThenTen: { type: replace, replace: { oldValue: 1 } },
            two: { type: update, update: 2 },
        };
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            oneThenTen: { type: update, update: 10 },
            three: { type: update, update: 3 },
        };
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(
            Result.ok({
                oneThenTen: { type: replace, replace: { oldValue: 1 } },
                two: { type: update, update: 2 },
                three: { type: update, update: 3 },
            })
        );
        expect(innerApplyBack).not.toBeCalled();
        expect(innerCompose).not.toBeCalled();
    });

    it('tests update->replace', () => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            oneThenTen: { type: update, update: 1 },
            two: { type: update, update: 2 },
        };
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            oneThenTen: { type: replace, replace: { oldValue: 10 } },
            three: { type: update, update: 3 },
        };
        const innerApplyBack = jest.fn(() => {
            return Result.ok(1);
        });
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(
            Result.ok({
                oneThenTen: { type: replace, replace: { oldValue: 1 } },
                two: { type: update, update: 2 },
                three: { type: update, update: 3 },
            })
        );
        expect(innerApplyBack).toHaveBeenCalledTimes(1);
        expect(innerApplyBack.mock.lastCall).toEqual([
            { key: 'oneThenTen', state: 10, operation: 1 },
        ]);
        expect(innerCompose).not.toBeCalled();
    });

    it('tests innerApplyBack to return error', () => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            oneThenTen: { type: update, update: 1 },
            two: { type: update, update: 2 },
        };
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            oneThenTen: { type: replace, replace: { oldValue: 10 } },
            three: { type: update, update: 3 },
        };
        const innerApplyBack = jest.fn(() => {
            return Result.error('test error');
        });
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual.isError).toBe(true);
    });

    it('tests replace->replace', () => {
        const first: Parameters<typeof composeDownOperation>[0]['first'] = {
            oneThenTen: { type: replace, replace: { oldValue: 1 } },
            two: { type: update, update: 2 },
        };
        const second: Parameters<typeof composeDownOperation>[0]['second'] = {
            oneThenTen: { type: replace, replace: { oldValue: 10 } },
            three: { type: update, update: 3 },
        };
        const innerApplyBack = jest.fn();
        const innerCompose = jest.fn();
        const actual = composeDownOperation({ first, second, innerApplyBack, innerCompose });
        expect(actual).toEqual(
            Result.ok({
                oneThenTen: { type: replace, replace: { oldValue: 1 } },
                two: { type: update, update: 2 },
                three: { type: update, update: 3 },
            })
        );
        expect(innerApplyBack).not.toBeCalled();
        expect(innerCompose).not.toBeCalled();
    });
});

describe('recordOperation.serverTransform', () => {
    it.each([
        { first: undefined, second: undefined },
        { first: {}, second: undefined },
        { first: undefined, second: {} },
        { first: {}, second: {} },
    ])('tests %j to return undefined', ({ first, second }) => {
        const toServerState = jest.fn();
        const innerTransform = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { a: 1 },
            stateAfterFirst: { a: 1 },
            first,
            second,
            toServerState,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(Result.ok(undefined));
        expect(toServerState).not.toBeCalled();
        expect(innerTransform).not.toBeCalled();
    });

    it('tests callback on update', () => {
        const toServerState = jest.fn();
        const innerTransform = jest.fn(() => Result.ok('2,3'));
        serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 2 },
            first: {
                target: { type: update, update: '1,2' },
            },
            second: {
                target: { type: update, update: '1,3' },
            },
            toServerState,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(toServerState).not.toBeCalled();
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([
            { key: 'target', prevState: 1, nextState: 2, first: '1,2', second: '1,3' },
        ]);
    });

    it('tests callback on replace', () => {
        const toServerState = jest.fn(() => 2);
        const innerTransform = jest.fn();
        serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0, another: 1 },
            first: {
                another: { type: replace, replace: { newValue: 1 } },
            },
            second: {
                target: { type: replace, replace: { newValue: 2 } },
            },
            toServerState,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(toServerState).toBeCalledTimes(1);
        expect(toServerState.mock.lastCall).toEqual([2, 'target']);
        expect(innerTransform).not.toBeCalled();
    });

    it('tests first=id and second=update(ok)', () => {
        const innerTransform = () => Result.ok(3);
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 1 },
            second: {
                target: { type: update, update: 2 },
            },
            toServerState: notToBeCalled,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(
            Result.ok({
                target: { type: update, update: 3 },
            })
        );
    });

    it('tests first=id and second=update(error)', () => {
        const innerTransform = () => Result.error('test error');
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 1 },
            second: {
                target: { type: update, update: 2 },
            },
            toServerState: notToBeCalled,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(actual.isError).toBe(true);
    });

    it('tests first=id and second=replace(add)', () => {
        const toServerState = () => 1;
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0 },
            second: {
                target: { type: replace, replace: { newValue: '1' } },
            },
            toServerState,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(
            Result.ok({
                target: { type: replace, replace: { newValue: 1 } },
            })
        );
    });

    it('tests first=id and second=replace(remove)', () => {
        const toServerState = () => undefined;
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0 },
            second: {
                target: { type: replace, replace: { newValue: 1 } },
            },
            toServerState,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(
            Result.ok({
                target: { type: replace, replace: { newValue: undefined } },
            })
        );
    });

    it('tests first=update and second=update(ok)', () => {
        const innerTransform = () => Result.ok('2,3');
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 2 },
            first: {
                target: { type: update, update: '1,2' },
            },
            second: {
                target: { type: update, update: '1,3' },
            },
            toServerState: notToBeCalled,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(
            Result.ok({
                target: { type: update, update: '2,3' },
            })
        );
    });

    it('tests first=update and second=update(error)', () => {
        const innerTransform = () => Result.error('test error');
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 2 },
            first: {
                target: { type: update, update: '1,2' },
            },
            second: {
                target: { type: update, update: '1,3' },
            },
            toServerState: notToBeCalled,
            innerTransform,
            cancellationPolicy: {},
        });
        expect(actual.isError).toBe(true);
    });

    it('tests first=update and second=replace(add)', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 2 },
            first: {
                target: { type: update, update: '1,2' },
            },
            second: {
                target: { type: replace, replace: { newValue: 3 } },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual.isError).toBe(true);
    });

    it('tests first=update and second=replace(remove)', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0, target: 2 },
            first: {
                target: { type: update, update: '1,2' },
            },
            second: {
                target: { type: replace, replace: { newValue: undefined } },
            },
            toServerState: x => x,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(
            Result.ok({
                target: { type: replace, replace: { oldValue: 2, newValue: undefined } },
            })
        );
    });

    it('tests first=replace(add) and second=update', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0, target: 1 },
            first: {
                target: { type: replace, replace: { newValue: 1 } },
            },
            second: {
                target: { type: update, update: '1,3' },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual.isError).toBe(true);
    });

    it('tests first=replace(add) and second=replace(add)', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0, target: 1 },
            first: {
                target: { type: replace, replace: { newValue: 1 } },
            },
            second: {
                target: { type: replace, replace: { newValue: 2 } },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(Result.ok(undefined));
    });

    it('tests first=replace(add) and second=replace(remove)', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0, target: 1 },
            first: {
                target: { type: replace, replace: { newValue: 1 } },
            },
            second: {
                target: { type: replace, replace: { newValue: undefined } },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual.isError).toBe(true);
    });

    it('tests first=replace(remove) and second=update', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0 },
            first: {
                target: { type: replace, replace: { newValue: undefined } },
            },
            second: {
                target: { type: update, update: '1,2' },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(Result.ok(undefined));
    });

    it('tests first=replace(remove) and second=replace(add)', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0 },
            first: {
                target: { type: replace, replace: { newValue: undefined } },
            },
            second: {
                target: { type: replace, replace: { newValue: '2' } },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual.isError).toBe(true);
    });

    it('tests first=replace(remove) and second=replace(remove)', () => {
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, target: 1 },
            stateAfterFirst: { noChange: 0 },
            first: {
                target: { type: replace, replace: { newValue: undefined } },
            },
            second: {
                target: { type: replace, replace: { newValue: undefined } },
            },
            toServerState: notToBeCalled,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
        });
        expect(actual).toEqual(Result.ok(undefined));
    });

    it('tests CancellationPolicy.cancelCreate', () => {
        const cancelRemove = jest.fn();
        const cancelUpdate = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0 },
            stateAfterFirst: { noChange: 0 },
            second: {
                cancel: { type: replace, replace: { newValue: 1 } },
                noCancel: { type: replace, replace: { newValue: 2 } },
            },
            toServerState: x => x,
            innerTransform: notToBeCalled,
            cancellationPolicy: {
                cancelCreate: ({ key, newState }) => {
                    if (key === 'cancel' && newState === 1) {
                        return true;
                    }
                    if (key === 'noCancel' && newState === 2) {
                        return false;
                    }
                    throw new Error(
                        `${JSON.stringify({ key, newState })} is not expected. Check test code.`
                    );
                },
                cancelRemove,
                cancelUpdate,
            },
        });
        expect(actual).toEqual(
            Result.ok({
                noCancel: { type: replace, replace: { newValue: 2 } },
            })
        );
        expect(cancelRemove).not.toBeCalled();
        expect(cancelUpdate).not.toBeCalled();
    });

    it('tests CancellationPolicy.cancelRemove', () => {
        const cancelCreate = jest.fn();
        const cancelUpdate = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, cancel: 1, noCancel: 2 },
            stateAfterFirst: { noChange: 0, cancel: 1, noCancel: 2 },
            second: {
                cancel: { type: replace, replace: { newValue: undefined } },
                noCancel: { type: replace, replace: { newValue: undefined } },
            },
            toServerState: x => x,
            innerTransform: notToBeCalled,
            cancellationPolicy: {
                cancelCreate,
                cancelRemove: ({ key, state }) => {
                    if (key === 'cancel' && state === 1) {
                        return true;
                    }
                    if (key === 'noCancel' && state === 2) {
                        return false;
                    }
                    throw new Error(
                        `${JSON.stringify({ key, state })} is not expected. Check test code.`
                    );
                },
                cancelUpdate,
            },
        });
        expect(actual).toEqual(
            Result.ok({
                noCancel: { type: replace, replace: { oldValue: 2, newValue: undefined } },
            })
        );
        expect(cancelCreate).not.toBeCalled();
        expect(cancelUpdate).not.toBeCalled();
    });

    it('tests CancellationPolicy.cancelUpdate', () => {
        const cancelCreate = jest.fn();
        const cancelRemove = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { noChange: 0, cancel: 1, noCancel: 2 },
            stateAfterFirst: { noChange: 0, cancel: 10, noCancel: 20 },
            first: {
                cancel: { type: update, update: '1,10' },
                noCancel: { type: update, update: '2,20' },
            },
            second: {
                cancel: { type: update, update: '1,100' },
                noCancel: { type: update, update: '2,200' },
            },
            toServerState: notToBeCalled,
            innerTransform: params => Result.ok(params.second),
            cancellationPolicy: {
                cancelCreate,
                cancelRemove,
                cancelUpdate: ({ key, prevState, nextState }) => {
                    if (key === 'cancel' && prevState === 1 && nextState === 10) {
                        return true;
                    }
                    if (key === 'noCancel' && prevState === 2 && nextState === 20) {
                        return false;
                    }
                    throw new Error(
                        `${JSON.stringify({
                            key,
                            prevState,
                            nextState,
                        })} is not expected. Check test code.`
                    );
                },
            },
        });
        expect(actual).toEqual(
            Result.ok({
                noCancel: { type: update, update: '2,200' },
            })
        );
        expect(cancelCreate).not.toBeCalled();
        expect(cancelRemove).not.toBeCalled();
    });

    it('tests validation.maxRecordLength to exceed', () => {
        const state = createRecord(10);
        const actual = serverTransform({
            stateBeforeFirst: state,
            stateAfterFirst: state,
            second: { toAdd: { type: replace, replace: { newValue: 'add' } } },
            toServerState: x => x,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
            validation: {
                recordName: 'test name',
                maxRecordLength: 10,
            },
        });
        expect(actual.isError).toBe(true);
    });

    it('tests validation.maxRecordLength to not exceed', () => {
        const state = createRecord(10);
        const actual = serverTransform({
            stateBeforeFirst: state,
            stateAfterFirst: state,
            second: { toAdd: { type: replace, replace: { newValue: 'add' } } },
            toServerState: x => x,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
            validation: {
                recordName: 'test name',
                maxRecordLength: 11,
            },
        });
        expect(actual.isError).toBe(false);
    });

    it('should ignore validation.maxRecordLength if record length is decreased', () => {
        const state = { ...createRecord(11), toRemove: 'toRemove' };
        const actual = serverTransform({
            stateBeforeFirst: state,
            stateAfterFirst: state,
            second: { toRemove: { type: replace, replace: { newValue: undefined } } },
            toServerState: x => x,
            innerTransform: notToBeCalled,
            cancellationPolicy: {},
            validation: {
                recordName: 'test name',
                maxRecordLength: 10,
            },
        });
        expect(actual.isError).toBe(false);
    });

    it('should ignore validation.maxRecordLength if record length is not changed', () => {
        const state = { ...createRecord(11), toUpdate: 'toUpdate' };
        const actual = serverTransform({
            stateBeforeFirst: state,
            stateAfterFirst: state,
            second: { toUpdate: { type: update, update: 'update' } },
            toServerState: notToBeCalled,
            innerTransform: ({ second }) => Result.ok(second),
            cancellationPolicy: {},
            validation: {
                recordName: 'test name',
                maxRecordLength: 10,
            },
        });
        expect(actual.isError).toBe(false);
    });
});

describe('recordOperation.clientTransform', () => {
    it.each([
        { first: undefined, second: undefined },
        { first: {}, second: undefined },
        { first: undefined, second: {} },
        { first: {}, second: {} },
    ])('tests %j to return undefined', ({ first, second }) => {
        const innerDiff = jest.fn();
        const innerTransform = jest.fn();
        const actual = clientTransform({
            state: { foo: 1 },
            first,
            second,
            innerDiff,
            innerTransform,
        });
        expect(actual).toEqual(Result.ok({ firstPrime: undefined, secondPrime: undefined }));
        expect(innerDiff).not.toBeCalled();
        expect(innerTransform).not.toBeCalled();
    });

    it('tests callback on update', () => {
        const innerDiff = jest.fn();
        const innerTransform = jest.fn(() =>
            Result.ok({ firstPrime: undefined, secondPrime: '2,3' })
        );
        clientTransform({
            state: { target: '1' },
            first: {
                target: { type: update, update: '1,2' },
            },
            second: {
                target: { type: update, update: '1,3' },
            },
            innerDiff,
            innerTransform,
        });
        expect(innerDiff).not.toBeCalled();
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([{ state: '1', first: '1,2', second: '1,3' }]);
    });

    it('tests callback on replace', () => {
        const innerDiff = jest.fn(() => '2,1');
        const innerTransform = jest.fn();
        clientTransform({
            state: {},
            first: {
                target: { type: replace, replace: { newValue: 1 } },
            },
            second: {
                target: { type: replace, replace: { newValue: 2 } },
            },
            innerDiff,
            innerTransform,
        });
        expect(innerDiff).toBeCalledTimes(1);
        expect(innerDiff.mock.lastCall).toEqual([{ prevState: 2, nextState: 1 }]);
        expect(innerTransform).not.toBeCalled();
    });
});

describe('recordOperation.diff', () => {
    it('tests innerDiff callback', () => {
        const innerDiff = jest.fn(() => '1,2');
        diff({ prevState: { target: 1 }, nextState: { target: 2 }, innerDiff });
        expect(innerDiff).toBeCalledTimes(1);
        expect(innerDiff.mock.lastCall).toEqual([{ key: 'target', prevState: 1, nextState: 2 }]);
    });

    it('tests replace', () => {
        const innerDiff = jest.fn();
        const actual = diff({ prevState: { p: 1 }, nextState: { n: 2 }, innerDiff });
        expect(actual).toEqual({
            p: { type: replace, replace: { oldValue: 1, newValue: undefined } },
            n: { type: replace, replace: { oldValue: undefined, newValue: 2 } },
        });
        expect(innerDiff).not.toBeCalled();
    });

    it('tests update as non-id', () => {
        const innerDiff = () => '1,2';
        const actual = diff({ prevState: { target: 1 }, nextState: { target: 2 }, innerDiff });
        expect(actual).toEqual({
            target: { type: update, update: '1,2' },
        });
    });

    it('tests update as id', () => {
        const innerDiff = () => undefined;
        const actual = diff({ prevState: { target: 1 }, nextState: { target: 1 }, innerDiff });
        expect(actual).toEqual(undefined);
    });
});
