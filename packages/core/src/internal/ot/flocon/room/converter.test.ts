import { Fixtures } from '../../../__test__/fixtures';
import { diff, toDownOperation, toUpOperation } from '../../generator';
import {
    decodeDbState,
    decodeDownOperation,
    exactDbState,
    exactDownOperation,
    parseState,
    parseUpOperation,
    stringifyState,
    stringifyUpOperation,
} from './converter';
import { template } from './types';

const getUpOperation = () => {
    const twoWayOperation = diff(template)({
        prevState: Fixtures.minimumState,
        nextState: Fixtures.complexState,
    });
    if (twoWayOperation == null) {
        throw new Error('prevState and nextState must not be same');
    }
    return toUpOperation(template)(twoWayOperation);
};

const getDownOperation = () => {
    const twoWayOperation = diff(template)({
        prevState: Fixtures.minimumState,
        nextState: Fixtures.complexState,
    });
    if (twoWayOperation == null) {
        throw new Error('prevState and nextState must not be same');
    }
    return toDownOperation(template)(twoWayOperation);
};

test('decodeDbState to be success', () => {
    const expected = Fixtures.complexDbState;
    expect(decodeDbState(expected)).toEqual(expected);
});

test('decodeDbState to fail', () => {
    const source = getUpOperation();
    expect(() => decodeDbState(source)).toThrow();
});

test('exactDbState', () => {
    const source = { ...Fixtures.complexDbState, foo: 1 };
    expect(exactDbState(source)).toEqual(Fixtures.complexDbState);
});

test('stringifyState -> parseState', () => {
    const expected = Fixtures.complexState;
    const actual = parseState(stringifyState(expected));
    expect(actual).toEqual(expected);
});

test('stringifyUpOperation -> parseUpOperation', () => {
    const expected = getUpOperation();
    const actual = parseUpOperation(stringifyUpOperation(expected));
    expect(actual).toEqual(expected);
});

test('decodeDownOperation', () => {
    const expected = getDownOperation();
    expect(decodeDownOperation(expected)).toEqual(expected);
});

test('decodeDownOperation to fail', () => {
    const expected = Fixtures.complexDbState;
    expect(() => decodeDownOperation(expected)).toThrow();
});

test('exactDownOperation', () => {
    const expected = getDownOperation();
    const source = { ...expected, foo: 1 };
    expect(exactDownOperation(source)).toEqual(expected);
});
