import { None, Option } from '@kizahasi/option';
import { beginTypeGuard } from '../src/internal/typeGuard';

it('tests null', () => {
    const actual: Option<null> = beginTypeGuard(null).addNull().end();
    expect(actual).toEqual(Option.some(null));
});

it('tests undefined', () => {
    const actual: Option<undefined> = beginTypeGuard(undefined).addUndefined().end();
    expect(actual).toEqual(Option.some(undefined));
});

it('tests true', () => {
    const actual: Option<boolean> = beginTypeGuard(true).addBoolean().end();
    expect(actual).toEqual(Option.some(true));
});

it('tests 17', () => {
    const actual: Option<number> = beginTypeGuard(17).addNumber().end();
    expect(actual).toEqual(Option.some(17));
});

it('tests "STRING"', () => {
    const actual: Option<string> = beginTypeGuard('STRING').addString().end();
    expect(actual).toEqual(Option.some('STRING'));
});

it('tests []', () => {
    const actual: Option<unknown[]> = beginTypeGuard([]).addArray().end();
    expect(actual).toEqual(Option.some([]));
});

it('tests 17 as "always None"', () => {
    const actual: None = beginTypeGuard(17).end();
    expect(actual).toEqual(Option.none());
});

it('tests 17 as string', () => {
    const actual: Option<string> = beginTypeGuard(17).addString().end();
    expect(actual).toEqual(Option.none());
});

it('tests 17 as string | number', () => {
    const actual: Option<string | number> = beginTypeGuard(17).addString().addNumber().end();
    expect(actual).toEqual(Option.some(17));
});
