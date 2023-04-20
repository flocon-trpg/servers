import { Result } from '@kizahasi/result';
import {
    apply,
    applyBack,
    clientTransform,
    compose,
    diff,
    restore,
    serverTransform,
} from './paramRecordOperation';

describe('paramRecordOperation.restore', () => {
    it.each([undefined, {}])('tests empty downOperation', downOperation => {
        const innerRestore = jest.fn();
        const state = {
            a: 1,
            b: 2,
        };
        const actual = restore({
            nextState: state,
            downOperation,
            innerRestore,
        });
        expect(innerRestore).not.toBeCalled();
        expect(actual.value?.prevState).toEqual(state);
        expect(actual.value?.twoWayOperation).toBeUndefined();
    });

    it('tests innerRestore to return non-undefined', () => {
        const innerRestore = jest.fn(() => {
            return Result.ok({ prevState: 1, twoWayOperation: '1,10' });
        });
        const actual = restore({
            nextState: { one: 10, two: 20 },
            downOperation: { one: 1 },
            innerRestore,
        });
        expect(innerRestore).toHaveBeenCalledTimes(1);
        expect(innerRestore.mock.lastCall).toEqual([
            { key: 'one', nextState: 10, downOperation: 1 },
        ]);
        expect(actual.value?.prevState).toEqual({ one: 1, two: 20 });
        expect(actual.value?.twoWayOperation).toEqual({ one: '1,10' });
    });

    it('tests innerRestore to return undefined', () => {
        const innerRestore = () => {
            return Result.ok(undefined);
        };
        const state = { one: 10, two: 20 };
        const actual = restore({
            nextState: { one: 10, two: 20 },
            downOperation: { one: 1 },
            innerRestore,
        });
        expect(actual.value?.prevState).toEqual(state);
        expect(actual.value?.twoWayOperation).toBeUndefined();
    });

    it('tests update(not exist)', () => {
        const notToBeCalled = jest.fn();
        const actual = restore({
            nextState: { one: 1 },
            downOperation: { two: 2 },
            innerRestore: notToBeCalled,
        });
        expect(actual.isError).toBe(true);
        expect(notToBeCalled).not.toBeCalled();
    });
});

describe('paramRecordOperation.apply', () => {
    it.each([undefined, {}])('tests empty operation', operation => {
        const innerApply = jest.fn();
        const state = { one: 1 };
        const actual = apply({ prevState: state, operation, innerApply, defaultState: 0 });
        expect(actual).toEqual(Result.ok(state));
    });

    it('tests update without defaultState as success', () => {
        const innerApply = jest.fn(() => {
            return Result.ok(10);
        });
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { one: '1,10' },
            innerApply,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok({ one: 10, two: 2 }));
        expect(innerApply).toHaveBeenCalledTimes(1);
        expect(innerApply.mock.lastCall).toEqual([{ key: 'one', prevState: 1, operation: '1,10' }]);
    });

    it('tests update with defaultState as success', () => {
        const innerApply = jest.fn(() => {
            return Result.ok(1);
        });
        const actual = apply({
            prevState: { two: 2 },
            operation: { one: '0,1' },
            innerApply,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok({ one: 1, two: 2 }));
        expect(innerApply).toHaveBeenCalledTimes(1);
        expect(innerApply.mock.lastCall).toEqual([{ key: 'one', prevState: 0, operation: '0,1' }]);
    });

    it('tests update to return error at innerApply', () => {
        const innerApply = jest.fn(() => {
            return Result.error('test error');
        });
        const actual = apply({
            prevState: { one: 1, two: 2 },
            operation: { one: '1,10' },
            innerApply,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.error('test error'));
        expect(innerApply).toHaveBeenCalledTimes(1);
        expect(innerApply.mock.lastCall).toEqual([{ key: 'one', prevState: 1, operation: '1,10' }]);
    });
});

describe('paramRecordOperation.applyBack', () => {
    it.each([undefined, {}])('tests empty operation', operation => {
        const innerApplyBack = jest.fn();
        const state = { one: 1 };
        const actual = applyBack({ nextState: state, operation, innerApplyBack, defaultState: 0 });
        expect(actual).toEqual(Result.ok(state));
    });

    it('tests update without defaultState as success', () => {
        const innerApplyBack = jest.fn(() => {
            return Result.ok(1);
        });
        const actual = applyBack({
            nextState: { one: 10, two: 2 },
            operation: { one: '1,10' },
            innerApplyBack,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok({ one: 1, two: 2 }));
        expect(innerApplyBack).toHaveBeenCalledTimes(1);
        expect(innerApplyBack.mock.lastCall).toEqual([
            { key: 'one', nextState: 10, operation: '1,10' },
        ]);
    });

    it('tests update with defaultState as success', () => {
        const innerApplyBack = jest.fn(() => {
            return Result.ok(0);
        });
        const actual = applyBack({
            nextState: { two: 2 },
            operation: { zero: '0,1' },
            innerApplyBack,
            defaultState: 1,
        });
        expect(actual).toEqual(Result.ok({ zero: 0, two: 2 }));
        expect(innerApplyBack).toHaveBeenCalledTimes(1);
        expect(innerApplyBack.mock.lastCall).toEqual([
            { key: 'zero', nextState: 1, operation: '0,1' },
        ]);
    });

    it('tests innerApply to return error', () => {
        const innerApplyBack = jest.fn(() => {
            return Result.error('test error');
        });
        const actual = applyBack({
            nextState: { one: 10, two: 2 },
            operation: { one: '1,10' },
            innerApplyBack,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.error('test error'));
        expect(innerApplyBack).toHaveBeenCalledTimes(1);
        expect(innerApplyBack.mock.lastCall).toEqual([
            { key: 'one', nextState: 10, operation: '1,10' },
        ]);
    });
});

describe('paramRecordOperation.compose', () => {
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
        const innerCompose = jest.fn();
        const actual = compose({ first, second, innerCompose });
        expect(actual).toEqual(Result.ok(undefined));
        expect(innerCompose).not.toBeCalled();
    });

    it.each([undefined, {}])('tests first=%p and second=update', first => {
        const second: Parameters<typeof compose>[0]['second'] = {
            one: 1,
        };
        const innerCompose = jest.fn();
        const actual = compose({ first, second, innerCompose });
        expect(actual).toEqual(Result.ok(second));
        expect(innerCompose).not.toBeCalled();
    });

    it.each([undefined, {}])('tests first=update and second=%p', second => {
        const first: Parameters<typeof compose>[0]['first'] = {
            one: 1,
        };
        const innerCompose = jest.fn();
        const actual = compose({ first, second, innerCompose });
        expect(actual).toEqual(Result.ok(first));
        expect(innerCompose).not.toBeCalled();
    });

    it('tests update->update', () => {
        const first: Parameters<typeof compose>[0]['first'] = {
            oneThenTen: 1,
            two: 2,
        };
        const second: Parameters<typeof compose>[0]['second'] = {
            oneThenTen: 10,
            three: 3,
        };
        const innerCompose = jest.fn(() => {
            return Result.ok(11);
        });
        const actual = compose({ first, second, innerCompose });
        expect(actual).toEqual(
            Result.ok({
                oneThenTen: 11,
                two: 2,
                three: 3,
            })
        );
        expect(innerCompose).toHaveBeenCalledTimes(1);
        expect(innerCompose.mock.lastCall).toEqual([{ key: 'oneThenTen', first: 1, second: 10 }]);
    });

    it('tests innerCompose to return error', () => {
        const first: Parameters<typeof compose>[0]['first'] = {
            oneThenTen: 1,
            two: 2,
        };
        const second: Parameters<typeof compose>[0]['second'] = {
            oneThenTen: 10,
            three: 3,
        };
        const innerCompose = jest.fn(() => {
            return Result.error('test error');
        });
        const actual = compose({ first, second, innerCompose });
        expect(actual.error).toBeTruthy();
    });
});

/*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 1       | id     | non-id-xform-error | exists             | exists            |
| 2       | non-id | id                 | not-exists         | exists            |
| 3       | non-id | non-id-xform-ok    | exists             | exists            |
| 4       | id     | non-id-xform-error | not-exists         | not-exists        |
| 5       | non-id | non-id-xform-error | exists             | not-exists        |
| 6       | id     | non-id-xform-ok    | not-exists         | not-exists        |
| 7       | non-id | id                 | exists             | not-exists        |
| 8       | id     | id                 | not-exists         | not-exists        |

first と second における id と non-id は、テスト対象とするキーの値が変化する場合は non-id、変化しない場合は id という意味。
second の xform-ok は、innerTransform の結果が ok という意味。xform-error も同様。

上の表は、https://github.com/microsoft/pict を用いて生成した。input は下のとおり。

first: id, non-id
second: id, non-id-xform-ok, non-id-xform-error
state_before_first: exists, not-exists
state_after_first: exists, not-exists
IF [first] = "id" THEN [state_before_first] = [state_after_first];
*/
describe('paramRecordOperation.serverTransform', () => {
    /*
| case id | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 8       | id     | id                 | not-exists         | not-exists        |

このパターンに加えて、id の場合は常に undefined を返すかどうかを確認するテストもあわせて行っている。
*/
    it.each([
        { first: undefined, second: undefined },
        { first: {}, second: undefined },
        { first: undefined, second: {} },
        { first: {}, second: {} },
    ])('should return undefined - %j', ({ first, second }) => {
        const innerTransform = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { a: 1 },
            stateAfterFirst: { a: 1 },
            first,
            second,
            innerTransform,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok(undefined));
        expect(innerTransform).not.toBeCalled();
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 1       | id     | non-id-xform-error | exists             | exists            |
*/
    it('tests case 1', () => {
        const innerTransform = jest.fn(() => Result.error('test error'));
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1, target: 1 },
            stateAfterFirst: { noChange: -1, target: 1 },
            second: {
                target: '1,2',
            },
            innerTransform,
            defaultState: 0,
        });
        expect(actual.isError).toBe(true);
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([
            { key: 'target', prevState: 1, nextState: 1, first: undefined, second: '1,2' },
        ]);
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 2       | non-id | id                 | not-exists         | exists            |
*/
    it('tests case 2', () => {
        const innerTransform = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1 },
            stateAfterFirst: { noChange: -1, target: 1 },
            innerTransform,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok(undefined));
        expect(innerTransform).not.toBeCalled();
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 3       | non-id | non-id-xform-ok    | exists             | exists            |
*/
    it('tests case 3', () => {
        const innerTransform = jest.fn(() => Result.ok('2,3'));
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1, target: 1 },
            stateAfterFirst: { noChange: -1, target: 2 },
            first: { target: '1,2' },
            second: { target: '1,3' },
            innerTransform,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok({ target: '2,3' }));
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([
            { key: 'target', prevState: 1, nextState: 2, first: '1,2', second: '1,3' },
        ]);
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 4       | id     | non-id-xform-error | not-exists         | not-exists        |
*/
    it('tests case 4', () => {
        const innerTransform = jest.fn(() => Result.error('test error'));
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1 },
            stateAfterFirst: { noChange: -1 },
            second: {
                target: '0,1',
            },
            innerTransform,
            defaultState: 0,
        });
        expect(actual.isError).toBe(true);
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([
            { key: 'target', prevState: 0, nextState: 0, first: undefined, second: '0,1' },
        ]);
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 5       | non-id | non-id-xform-error | exists             | not-exists        |
*/
    it('tests case 5', () => {
        const innerTransform = jest.fn(() => Result.error('test error'));
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1, target: 1 },
            stateAfterFirst: { noChange: -1 },
            first: { target: '1,0' },
            second: { target: '1,2' },
            innerTransform,
            defaultState: 0,
        });
        expect(actual.isError).toBe(true);
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([
            { key: 'target', prevState: 1, nextState: 0, first: '1,0', second: '1,2' },
        ]);
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 6       | id     | non-id-xform-ok    | not-exists         | not-exists        |
*/
    it('tests case 6', () => {
        const innerTransform = jest.fn(() => Result.ok('0,1(xform)'));
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1 },
            stateAfterFirst: { noChange: -1 },
            second: {
                target: '0,1',
            },
            innerTransform,
            defaultState: 0,
        });
        expect(actual).toEqual(
            Result.ok({
                target: '0,1(xform)',
            })
        );
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([
            { key: 'target', prevState: 0, nextState: 0, first: undefined, second: '0,1' },
        ]);
    });

    /*
| case ID | first  | second             | state_before_first | state_after_first |
| ------- | ------ | ------------------ | ------------------ | ----------------- |
| 7       | non-id | id                 | exists             | not-exists        |
*/
    it('tests case 7', () => {
        const innerTransform = jest.fn();
        const actual = serverTransform({
            stateBeforeFirst: { noChange: -1, target: 1 },
            stateAfterFirst: { noChange: -1 },
            first: {
                target: '1,0',
            },
            innerTransform,
            defaultState: 0,
        });
        expect(actual).toEqual(Result.ok(undefined));
        expect(innerTransform).not.toBeCalled();
    });
});

/*
| case ID | first  | second | innerTransform |
| ------- | ------ | ------ | -------------- |
| 1       | id     | non-id | ok             |
| 2       | id     | id     | (none)         |
| 3       | non-id | non-id | error          |
| 4       | non-id | id     | ok             |
*/
describe('paramRecordOperation.clientTransform', () => {
    /*
| case ID | first  | second | innerTransform |
| ------- | ------ | ------ | -------------- |
| 2       | id     | id     | (none)         |

このパターンに加えて、id の場合は常に undefined を返すかどうかを確認するテストもあわせて行っている。
*/
    it.each([
        { first: undefined, second: undefined },
        { first: {}, second: undefined },
        { first: undefined, second: {} },
        { first: {}, second: {} },
    ])('tests %j to return undefined', ({ first, second }) => {
        const innerTransform = jest.fn();
        const actual = clientTransform({
            state: { foo: '1' },
            defaultState: '0',
            first,
            second,
            innerTransform,
        });
        expect(actual).toEqual(Result.ok({ firstPrime: undefined, secondPrime: undefined }));
        expect(innerTransform).not.toBeCalled();
    });

    /*
| case ID | first  | second | innerTransform |
| ------- | ------ | ------ | -------------- |
| 1       | id     | non-id | ok             |
*/
    it('tests case 1', () => {
        const innerTransform = jest.fn();
        const actual = clientTransform({
            state: { target: '1' },
            defaultState: '0',
            second: {
                target: '1,2',
            },
            innerTransform,
        });
        expect(actual).toEqual(
            Result.ok({ firstPrime: undefined, secondPrime: { target: '1,2' } })
        );
        expect(innerTransform).not.toBeCalled();
    });

    /*
| case ID | first  | second | innerTransform |
| ------- | ------ | ------ | -------------- |
| 3       | non-id | non-id | error          |
*/
    it('tests case 3', () => {
        const innerTransform = jest.fn(() => Result.error('test error'));
        const actual = clientTransform({
            state: { target: '1' },
            defaultState: '0',
            first: {
                target: '1,2',
            },
            second: {
                target: '1,3',
            },
            innerTransform,
        });
        expect(actual.isError).toBe(true);
        expect(innerTransform).toBeCalledTimes(1);
        expect(innerTransform.mock.lastCall).toEqual([{ state: '1', first: '1,2', second: '1,3' }]);
    });

    /*
| case ID | first  | second | innerTransform |
| ------- | ------ | ------ | -------------- |
| 4       | non-id | id     | ok             |
*/
    it('tests case 4', () => {
        const innerTransform = jest.fn();
        const actual = clientTransform({
            state: { target: '1' },
            defaultState: '0',
            first: {
                target: '1,2',
            },
            innerTransform,
        });
        expect(actual).toEqual(
            Result.ok({ firstPrime: { target: '1,2' }, secondPrime: undefined })
        );
        expect(innerTransform).not.toBeCalled();
    });
});

describe('paramRecordOperation.diff', () => {
    it('tests add', () => {
        const innerDiff = jest.fn(() => '0,1');
        const actual = diff({
            prevState: {},
            nextState: { target: 1 },
            innerDiff,
        });
        expect(actual).toEqual({
            target: '0,1',
        });
        expect(innerDiff).toBeCalledTimes(1);
        expect(innerDiff.mock.lastCall).toEqual([
            { key: 'target', prevState: undefined, nextState: 1 },
        ]);
    });

    it('tests remove', () => {
        const innerDiff = jest.fn(() => '1,0');
        const actual = diff({
            prevState: { target: 1 },
            nextState: {},
            innerDiff,
        });
        expect(actual).toEqual({
            target: '1,0',
        });
        expect(innerDiff).toBeCalledTimes(1);
        expect(innerDiff.mock.lastCall).toEqual([
            { key: 'target', prevState: 1, nextState: undefined },
        ]);
    });

    it('tests update as non-id', () => {
        const innerDiff = jest.fn(() => '1,2');
        const actual = diff({ prevState: { target: 1 }, nextState: { target: 2 }, innerDiff });
        expect(actual).toEqual({ target: '1,2' });
        expect(innerDiff).toBeCalledTimes(1);
        expect(innerDiff.mock.lastCall).toEqual([{ key: 'target', prevState: 1, nextState: 2 }]);
    });

    it('tests update as id', () => {
        const innerDiff = () => undefined;
        const actual = diff({ prevState: { target: 1 }, nextState: { target: 1 }, innerDiff });
        expect(actual).toEqual(undefined);
    });

    it('tests multiple keys', () => {
        const actual = diff({
            prevState: { zero: 0, two: 1 },
            nextState: { zero: 0, one: 1, two: 3 },
            innerDiff: ({ prevState, nextState }) => (nextState ?? 0) - (prevState ?? 0),
        });
        expect(actual).toEqual({ zero: 0, one: 1, two: 2 });
    });
});
