import _ from 'lodash';
import { MultiValueSet } from '..';

describe('multiValueSet', () => {
    it.each([
        {
            initKey: null,
            key: [],
        },
        {
            initKey: ['a'],
            key: ['a', 'b', 'c'],
        },
        {
            initKey: ['a', 'b', 'c'],
            key: ['a'],
        },
    ])('tests has and add and delete', ({ key, initKey }) => {
        const actual = new MultiValueSet<string>();
        expect(actual.has(key)).toBe(false);

        if (initKey != null) {
            actual.add(initKey);
        }

        actual.delete(key);

        actual.add(key);
        expect(actual.has(key)).toBe(true);

        actual.add(key);
        expect(actual.has(key)).toBe(true);

        actual.delete(key);
        expect(actual.has(key)).toBe(false);
    });

    it('tests size and toIterator', () => {
        const actual = new MultiValueSet<string>();
        expect(actual.size).toBe(0);
        expect([...actual.toIterator()]).toEqual([]);

        actual.add([]);
        actual.add(['a']);
        actual.add(['a', 'b']);
        actual.add(['b']);
        expect(actual.size).toBe(4);
        expect(
            _([...actual.toIterator()])
                .sortBy(x => JSON.stringify(x))
                .value()
        ).toEqual(
            _([[], ['a'], ['a', 'b'], ['b']])
                .sortBy(x => JSON.stringify(x))
                .value()
        );
    });

    it('tests clone', () => {
        const source = new MultiValueSet<string>();
        source.add([]);
        source.add(['a']);
        source.add(['a', 'b']);
        source.add(['b']);

        const cloned = source.clone();
        cloned.delete(['a']);
        expect(source.size).toBe(4);
        expect(cloned.size).toBe(3);
    });
});
