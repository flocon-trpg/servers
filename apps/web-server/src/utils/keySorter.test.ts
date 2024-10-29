/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';
import { KeySorter } from './keySorter';

describe('keySorter', () => {
    it.each`
        keys
        ${[]}
        ${['A']}
        ${['A', 'B']}
    `('tests id', ({ keys }) => {
        const availableKeys: string[] = keys;
        const keySorter = new KeySorter(availableKeys);
        const actual = keySorter.generate(availableKeys);
        expect(actual).toEqual(availableKeys);
    });

    it('tests to be sorted', () => {
        const availableKeys: string[] = ['A', 'B'];
        const keySorter = new KeySorter(availableKeys);
        const actual = keySorter.generate(['B', 'A']);
        expect(actual).toEqual(['B', 'A']);
    });

    it('tests to be equal to availableKeys always', () => {
        const availableKeys: string[] = ['A', 'B', 'C'];
        const keySorter = new KeySorter(availableKeys);
        const actual = keySorter.generate(['X', 'B']);
        expect([...actual].sort()).toEqual(['A', 'B', 'C']);
    });
});
