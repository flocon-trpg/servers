import { DualKeyMap } from '../src';

it('tests toArray() and spread operator', () => {
    const actual = new DualKeyMap<string, string, number>();
    actual.set({ first: '0-0', second: '0-1' }, 0);
    expect(actual.size).toBe(1);
    expect(actual.toArray().length).toBe(1);
    expect([...actual].length).toBe(1);
});
