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
import { Fixture } from '@/__test__/fixture';
import { diff, toDownOperation, toUpOperation } from '@/ot/generator';

const getUpOperation = () => {
    const twoWayOperation = diff(template)({
        prevState: Fixture.minimumState,
        nextState: Fixture.complexState,
    });
    if (twoWayOperation == null) {
        throw new Error('prevState and nextState must not be same');
    }
    return toUpOperation(template)(twoWayOperation);
};

const getDownOperation = () => {
    const twoWayOperation = diff(template)({
        prevState: Fixture.minimumState,
        nextState: Fixture.complexState,
    });
    if (twoWayOperation == null) {
        throw new Error('prevState and nextState must not be same');
    }
    return toDownOperation(template)(twoWayOperation);
};

test('decodeDbState to be success', () => {
    const expected = Fixture.complexDbState;
    expect(decodeDbState(expected)).toEqual(expected);
});

test('decodeDbState to fail', () => {
    const source = getUpOperation();
    expect(() => decodeDbState(source)).toThrow();
});

test('exactDbState', () => {
    const source = { ...Fixture.complexDbState, foo: 1 };
    expect(exactDbState(source)).toEqual(Fixture.complexDbState);
});

test('stringifyState -> parseState', () => {
    const expected = Fixture.complexState;
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
    const expected = Fixture.complexDbState;
    expect(() => decodeDownOperation(expected)).toThrow();
});

test('exactDownOperation', () => {
    const expected = getDownOperation();
    const source = { ...expected, foo: 1 };
    expect(exactDownOperation(source)).toEqual(expected);
});
