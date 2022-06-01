import { Result } from '@kizahasi/result';
import { parseStringToBoolean } from '../src';
import { ParseError } from '../src/internal/parseStringToBoolean';

namespace ExpectedResult {
    export const ok = <T>(value: T) => Result.ok(value);
    export const error = () => Result.error(undefined);
}

describe('parseStringToBoolean with type tests', () => {
    it.each([
        {
            source: '',
            expected: ExpectedResult.error(),
        },
        {
            source: 'true',
            expected: ExpectedResult.ok(true),
        },
        {
            source: 'false',
            expected: ExpectedResult.ok(false),
        },
    ])('tests string', ({ source, expected }) => {
        const actual: Result<boolean, ParseError> = parseStringToBoolean(source);
        expect(actual.isError).toBe(expected.isError);
        if (!expected.isError) {
            expect(actual.value).toBe(expected.value);
        }
    });

    it.each([
        {
            source: 'true',
            expected: true,
        },
        {
            source: null,
            expected: null,
        },
    ])('tests string | null', ({ source, expected }) => {
        const actual: Result<boolean | null, ParseError> = parseStringToBoolean(source);
        expect(actual.isError).toBe(false);
        expect(actual.value).toBe(expected);
    });

    it.each([
        {
            source: 'true',
            expected: true,
        },
        {
            source: undefined,
            expected: undefined,
        },
    ])('tests string | undefined', ({ source, expected }) => {
        const actual: Result<boolean | undefined, ParseError> = parseStringToBoolean(source);
        expect(actual.isError).toBe(false);
        expect(actual.value).toBe(expected);
    });

    it.each([
        {
            source: null,
            expected: null,
        },
        {
            source: undefined,
            expected: undefined,
        },
    ])('tests null | undefined', ({ source, expected }) => {
        const actual: Result<null | undefined, ParseError> = parseStringToBoolean(source);
        expect(actual.isError).toBe(false);
        expect(actual.value).toBe(expected);
    });

    it('tests null', () => {
        const actual: Result<null, ParseError> = parseStringToBoolean(null);
        expect(actual.value).toBeNull();
    });

    it('tests undefined', () => {
        const actual: Result<undefined, ParseError> = parseStringToBoolean(undefined);
        expect(actual.value).toBeUndefined();
    });
});
