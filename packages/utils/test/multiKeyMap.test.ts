import { MultiKeyMap } from '../src';

describe('multiKeyMap', () => {
    it('tests empty instance', () => {
        const actual = new MultiKeyMap<string, string>();
        expect(actual.get([])).toBeUndefined();
        expect(actual.get(['a', 'b'])).toBeUndefined();
        expect(actual.absolutePath).toEqual([]);
        expect(actual.size).toBe(0);
        expect([...actual.traverse()]).toEqual([]);
    });

    it.each([
        {
            key: [],
            initKey: null,
        },
        {
            key: ['a', 'b', 'c'],
            initKey: ['a'],
        },
        {
            key: ['a'],
            initKey: ['a', 'b', 'c'],
        },
    ])('tests replace', ({ key, initKey }) => {
        const actual = new MultiKeyMap<string, string>();

        if (initKey != null) {
            actual.set(initKey, 'ANOTHER_VALUE');
        }

        {
            const replacer = jest.fn<string | undefined, [string | undefined]>();
            replacer.mockReturnValueOnce('value1');
            const replaced = actual.replace(key, replacer);
            expect(replaced).toBe('value1');
            expect(replacer.mock.lastCall?.[0]).toBeUndefined();
            expect(actual.get(key)).toBe('value1');
        }

        {
            const replacer = jest.fn<string | undefined, [string | undefined]>();
            replacer.mockReturnValueOnce('value2');
            const replaced = actual.replace(key, replacer);
            expect(replaced).toBe('value2');
            expect(replacer.mock.lastCall?.[0]).toBe('value1');
            expect(actual.get(key)).toBe('value2');
        }

        {
            const replacer = jest.fn<string | undefined, [string | undefined]>();
            replacer.mockReturnValueOnce(undefined);
            const replaced = actual.replace(key, replacer);
            expect(replaced).toBeUndefined();
            expect(replacer.mock.lastCall?.[0]).toBe('value2');
            expect(actual.get(key)).toBeUndefined();
        }
    });

    it.each([
        {
            key: [],
            initKey: null,
        },
        {
            key: ['a', 'b', 'c'],
            initKey: ['a'],
        },
        {
            key: ['a'],
            initKey: ['a', 'b', 'c'],
        },
    ])('tests set', ({ key, initKey }) => {
        const actual = new MultiKeyMap<string, string>();

        if (initKey != null) {
            actual.set(initKey, 'ANOTHER_VALUE');
        }

        actual.set(key, 'newValue');
        expect(actual.get(key)).toBe('newValue');
    });

    it.each([
        {
            key: [],
            initKey: null,
        },
        {
            key: ['a', 'b', 'c'],
            initKey: ['a'],
        },
        {
            key: ['a'],
            initKey: ['a', 'b', 'c'],
        },
    ])('tests ensure to add value', ({ key, initKey }) => {
        const actual = new MultiKeyMap<string, string>();

        if (initKey != null) {
            actual.set(initKey, 'ANOTHER_VALUE');
        }

        const onCreate = jest.fn<string, []>();
        onCreate.mockReturnValueOnce('newValue');
        actual.ensure(key, onCreate);
        expect(actual.get(key)).toBe('newValue');
    });

    it.each([
        {
            key: [],
            initKey: null,
        },
        {
            key: ['a', 'b', 'c'],
            initKey: ['a'],
        },
        {
            key: ['a'],
            initKey: ['a', 'b', 'c'],
        },
    ])('tests ensure to get value', ({ key, initKey }) => {
        const actual = new MultiKeyMap<string, string>();

        if (initKey != null) {
            actual.set(initKey, 'ANOTHER_VALUE');
        }
        actual.set(key, 'oldValue');

        const onCreate = jest.fn<string, []>();
        onCreate.mockReturnValueOnce('newValue');
        actual.ensure(key, onCreate);
        expect(actual.get(key)).toBe('oldValue');
    });

    it.each([
        {
            deleteKey: [],
            retainKey: null,
        },
        {
            deleteKey: ['a', 'b', 'c'],
            retainKey: ['a'],
        },
        {
            deleteKey: ['a'],
            retainKey: ['a', 'b', 'c'],
        },
    ])('tests delete', ({ deleteKey, retainKey }) => {
        const actual = new MultiKeyMap<string, string>();

        actual.set(deleteKey, 'value');
        if (retainKey != null) {
            actual.set(retainKey, 'ANOTHER_VALUE');
        }

        actual.delete(deleteKey);
        expect(actual.get(deleteKey)).toBeUndefined();
        if (retainKey != null) {
            expect(actual.get(retainKey)).toBe('ANOTHER_VALUE');
        }
    });

    it.each([true, false])('tests absolutePath (setAnotherValue=%o)', setAnotherValue => {
        const actual = new MultiKeyMap<string, string>();
        if (setAnotherValue) {
            actual.set(['a', 'b'], 'a/b');
        }

        const a = actual.createSubMap(['a']);
        expect(a.absolutePath).toEqual(['a']);

        const ab = actual.createSubMap(['a', 'b']);
        expect(ab.absolutePath).toEqual(['a', 'b']);
    });

    it('tests map', () => {
        const keyToReplace = ['a', 'b', 'c'];
        const keyToDelete = ['b'];

        const source = new MultiKeyMap<string, string>();
        source.set([], '/');
        source.set(['a'], '/a');
        source.set(keyToReplace, '/a/b/c');
        source.set(keyToDelete, '/b');
        source.set(['b', 'c', 'd'], '/b/c/d');
        const cloned = source.map(x => (x.value === '/b' ? undefined : x.value + '(1)'));

        expect(cloned.get(keyToDelete)).toBeUndefined();

        const replacer = jest.fn<string | undefined, [string | undefined]>();
        replacer.mockReturnValueOnce('/a/b/c(2)');
        cloned.replace(keyToReplace, replacer);
        expect(replacer.mock.lastCall?.[0]).toBe('/a/b/c(1)');
        expect(source.get(keyToReplace)).toBe('/a/b/c');
        expect(cloned.get(keyToReplace)).toBe('/a/b/c(2)');
        expect(cloned.size).toBe(4);
    });

    it('tests traverse', () => {
        const source = new MultiKeyMap<string, string>();
        source.set([], '/');
        source.set(['a'], '/a');
        source.set(['a', 'b', 'c'], '/a/b/c');
        source.set(['c'], '/c');

        const actual = [...source.traverse()].sort((x, y) => x.value.localeCompare(y.value));
        const expected = [
            { absolutePath: [], value: '/' },
            { absolutePath: ['a'], value: '/a' },
            { absolutePath: ['a', 'b', 'c'], value: '/a/b/c' },
            { absolutePath: ['c'], value: '/c' },
        ].sort((x, y) => x.value.localeCompare(y.value));
        expect(actual).toEqual(expected);
    });
});
