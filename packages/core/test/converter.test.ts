import {
    decodeDbState,
    decodeDownOperation,
    diff,
    exactDbState,
    exactDownOperation,
    parseState,
    parseUpOperation,
    roomTemplate,
    stringifyState,
    stringifyUpOperation,
    toDownOperation,
    toUpOperation,
} from '../src';
import { Resources } from './resources';

const getUpOperation = () => {
    const twoWayOperation = diff(roomTemplate)({
        prevState: Resources.minimumState,
        nextState: Resources.complexState,
    });
    if (twoWayOperation == null) {
        throw new Error('prevState and nextState must not be same');
    }
    return toUpOperation(roomTemplate)(twoWayOperation);
};

const getDownOperation = () => {
    const twoWayOperation = diff(roomTemplate)({
        prevState: Resources.minimumState,
        nextState: Resources.complexState,
    });
    if (twoWayOperation == null) {
        throw new Error('prevState and nextState must not be same');
    }
    return toDownOperation(roomTemplate)(twoWayOperation);
};

test('decodeDbState to be success', () => {
    const expected = Resources.complexDbState;
    expect(decodeDbState(expected)).toEqual(expected);
});

test('decodeDbState to fail', () => {
    const source = getUpOperation();
    expect(() => decodeDbState(source)).toThrow();
});

test('exactDbState', () => {
    const source = { ...Resources.complexDbState, foo: 1 };
    expect(exactDbState(source)).toEqual(Resources.complexDbState);
});

test('stringifyState -> parseState', () => {
    const expected = Resources.complexState;
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
    const expected = Resources.complexDbState;
    expect(() => decodeDownOperation(expected)).toThrow();
});

test('exactDownOperation', () => {
    const expected = getDownOperation();
    const source = { ...expected, foo: 1 };
    expect(exactDownOperation(source)).toEqual(expected);
});
