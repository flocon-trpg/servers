import { Option } from '@kizahasi/option';
import { DeletableTree, groupJoinArray, left, right } from '..';

const sortByAbsolutePath = (
    x: { absolutePath: readonly string[] },
    y: { absolutePath: readonly string[] }
): number => {
    for (const elem of groupJoinArray(x.absolutePath, y.absolutePath)) {
        switch (elem.type) {
            case left:
                return 1;
            case right:
                return -1;
            default: {
                const stringCompareResult = elem.left.localeCompare(elem.right);
                if (stringCompareResult !== 0) {
                    return stringCompareResult;
                }
            }
        }
    }
    return 0;
};

describe('DeletableTree', () => {
    it('tests empty instance', () => {
        const actual = new DeletableTree<string, string>(Option.none());
        expect(actual.get([])).toEqual(Option.none());
        expect(actual.get(['a', 'b'])).toEqual(Option.none());
        expect(actual.absolutePath).toEqual([]);
        expect(actual.size).toBe(0);
        expect([...actual.traverse()]).toEqual([]);
    });

    it('tests ensure', () => {
        const actual = new DeletableTree<string, string>(Option.none());

        {
            const replacer = jest.fn(() => 'root');
            const initValue = jest.fn();

            const root = actual.ensure([], replacer, initValue);

            expect(root).toBe('root');
            expect(initValue).not.toHaveBeenCalled();
            expect(replacer).toHaveBeenCalledWith(Option.none());
            expect(actual.get([])).toEqual(Option.some('root'));
            expect(actual.get(['a'])).toEqual(Option.none());
            expect([...actual.traverse()].sort(sortByAbsolutePath)).toEqual(
                [{ absolutePath: [], value: 'root' }].sort(sortByAbsolutePath)
            );
        }

        {
            const replacer = jest.fn(() => 'a/b');
            const initValue = jest.fn();
            initValue.mockReturnValue('init1');

            const ab = actual.ensure(['a', 'b'], replacer, initValue);

            expect(ab).toBe('a/b');
            expect(initValue).toHaveBeenCalledTimes(1);
            expect(replacer).toHaveBeenCalledWith(Option.none());
            expect(actual.get([])).toEqual(Option.some('root'));
            expect(actual.get(['a'])).toEqual(Option.some('init1'));
            expect(actual.get(['a', 'b'])).toEqual(Option.some('a/b'));
            expect(actual.get(['b'])).toEqual(Option.none());
            expect([...actual.traverse()].sort(sortByAbsolutePath)).toEqual(
                [
                    { absolutePath: [], value: 'root' },
                    { absolutePath: ['a'], value: 'init1' },
                    { absolutePath: ['a', 'b'], value: 'a/b' },
                ].sort(sortByAbsolutePath)
            );
        }

        {
            const replacer = jest.fn(() => 'a');
            const initValue = jest.fn();

            const a = actual.ensure(['a'], replacer, initValue);

            expect(a).toBe('a');
            expect(initValue).not.toHaveBeenCalled();
            expect(replacer).toHaveBeenCalledWith(Option.some('init1'));
            expect(actual.get([])).toEqual(Option.some('root'));
            expect(actual.get(['a'])).toEqual(Option.some('a'));
            expect(actual.get(['a', 'b'])).toEqual(Option.some('a/b'));
            expect([...actual.traverse()].sort(sortByAbsolutePath)).toEqual(
                [
                    { absolutePath: [], value: 'root' },
                    { absolutePath: ['a'], value: 'a' },
                    { absolutePath: ['a', 'b'], value: 'a/b' },
                ].sort(sortByAbsolutePath)
            );
        }

        {
            const replacer = jest.fn(() => 'a2');
            const initValue = jest.fn();
            initValue.mockReturnValue('init2');

            const a2 = actual.ensure(['a2'], replacer, initValue);

            expect(a2).toBe('a2');
            expect(initValue).not.toHaveBeenCalledTimes(1);
            expect(replacer).toHaveBeenCalledWith(Option.none());
            expect(actual.get([])).toEqual(Option.some('root'));
            expect(actual.get(['a'])).toEqual(Option.some('a'));
            expect(actual.get(['a', 'b'])).toEqual(Option.some('a/b'));
            expect(actual.get(['a2'])).toEqual(Option.some('a2'));
            expect([...actual.traverse()].sort(sortByAbsolutePath)).toEqual(
                [
                    { absolutePath: [], value: 'root' },
                    { absolutePath: ['a'], value: 'a' },
                    { absolutePath: ['a', 'b'], value: 'a/b' },
                    { absolutePath: ['a2'], value: 'a2' },
                ].sort(sortByAbsolutePath)
            );
        }

        {
            const replacer = jest.fn(() => 'a/b/c/d/e');
            const initValue = jest.fn();
            initValue.mockReturnValue('init3');

            const abcde = actual.ensure(['a', 'b', 'c', 'd', 'e'], replacer, initValue);

            expect(abcde).toBe('a/b/c/d/e');
            expect(initValue).toHaveBeenCalledTimes(2);
            expect(replacer).toHaveBeenCalledWith(Option.none());
            expect(actual.get([])).toEqual(Option.some('root'));
            expect(actual.get(['a'])).toEqual(Option.some('a'));
            expect(actual.get(['a', 'b'])).toEqual(Option.some('a/b'));
            expect(actual.get(['a', 'b', 'c'])).toEqual(Option.some('init3'));
            expect(actual.get(['a', 'b', 'c', 'd'])).toEqual(Option.some('init3'));
            expect(actual.get(['a', 'b', 'c', 'd', 'e'])).toEqual(Option.some('a/b/c/d/e'));
            expect([...actual.traverse()].sort(sortByAbsolutePath)).toEqual(
                [
                    { absolutePath: [], value: 'root' },
                    { absolutePath: ['a'], value: 'a' },
                    { absolutePath: ['a', 'b'], value: 'a/b' },
                    { absolutePath: ['a', 'b', 'c'], value: 'init3' },
                    { absolutePath: ['a', 'b', 'c', 'd'], value: 'init3' },
                    { absolutePath: ['a', 'b', 'c', 'd', 'e'], value: 'a/b/c/d/e' },
                    { absolutePath: ['a2'], value: 'a2' },
                ].sort(sortByAbsolutePath)
            );
        }

        {
            const replacer = jest.fn(() => 'a/b/c/d/e2');
            const initValue = jest.fn();
            initValue.mockReturnValue('init4');

            const abcde2 = actual.ensure(['a', 'b', 'c', 'd', 'e2'], replacer, initValue);

            expect(abcde2).toBe('a/b/c/d/e2');
            expect(initValue).not.toHaveBeenCalled();
            expect(replacer).toHaveBeenCalledWith(Option.none());
            expect(actual.get(['a', 'b', 'c', 'd', 'e2'])).toEqual(Option.some('a/b/c/d/e2'));
            expect([...actual.traverse()].sort(sortByAbsolutePath)).toEqual(
                [
                    { absolutePath: [], value: 'root' },
                    { absolutePath: ['a'], value: 'a' },
                    { absolutePath: ['a', 'b'], value: 'a/b' },
                    { absolutePath: ['a', 'b', 'c'], value: 'init3' },
                    { absolutePath: ['a', 'b', 'c', 'd'], value: 'init3' },
                    { absolutePath: ['a', 'b', 'c', 'd', 'e'], value: 'a/b/c/d/e' },
                    { absolutePath: ['a', 'b', 'c', 'd', 'e2'], value: 'a/b/c/d/e2' },
                    { absolutePath: ['a2'], value: 'a2' },
                ].sort(sortByAbsolutePath)
            );
        }
    });

    it('tests getChildren', () => {
        const source = new DeletableTree<string, string>(Option.none());

        source.ensure(
            ['a'],
            () => 'a',
            () => 'init'
        );
        source.ensure(
            ['a', 'b'],
            () => 'a/b',
            () => 'init'
        );
        source.ensure(
            ['b'],
            () => 'b',
            () => 'init'
        );

        const children = source.getChildren();
        expect(children.size).toBe(2);
        expect([...(children.get('a')?.traverse() ?? [])].sort(sortByAbsolutePath)).toEqual(
            [
                { absolutePath: ['a'], value: 'a' },
                { absolutePath: ['a', 'b'], value: 'a/b' },
            ].sort(sortByAbsolutePath)
        );
        expect([...(children.get('b')?.traverse() ?? [])].sort(sortByAbsolutePath)).toEqual(
            [{ absolutePath: ['b'], value: 'b' }].sort(sortByAbsolutePath)
        );
    });

    it('tests createSubTree', () => {
        const source = new DeletableTree<string, string>(Option.none());

        const a = source.createSubTree(['a'], () => 'init');
        expect(a.absolutePath).toEqual(['a']);
        expect(source.size).toBe(1);

        const ab = source.createSubTree(['a', 'b'], () => 'init');
        expect(ab.absolutePath).toEqual(['a', 'b']);
        expect(source.size).toBe(2);

        const initValue = jest.fn();

        source.ensure(['a', 'b'], () => 'a/b', initValue);
        expect(a.get(['b'])).toEqual(Option.some('a/b'));
        expect(ab.get([])).toEqual(Option.some('a/b'));

        ab.ensure([], () => 'A/B', initValue);
        expect(source.get(['a', 'b'])).toEqual(Option.some('A/B'));
        expect(a.get(['b'])).toEqual(Option.some('A/B'));
    });

    it('tests map', () => {
        const source = new DeletableTree<string, number>(Option.some(0));
        source.ensure(
            ['1'],
            () => 1,
            () => -1
        );
        source.ensure(
            ['1', '2'],
            () => 12,
            () => -1
        );
        source.ensure(
            ['2'],
            () => 2,
            () => -1
        );
        const cloned = source.map(i => {
            if (i.absolutePath.length === 0) {
                expect(i.absolutePath).toEqual([]);
            } else {
                expect(i.absolutePath.join('')).toBe(i.value.toString());
            }
            return i.value.toString();
        });

        expect([...cloned.traverse()].sort(sortByAbsolutePath)).toEqual(
            [
                { absolutePath: [], value: '0' },
                { absolutePath: ['1'], value: '1' },
                { absolutePath: ['1', '2'], value: '12' },
                { absolutePath: ['2'], value: '2' },
            ].sort(sortByAbsolutePath)
        );
    });

    it('tests delete', () => {
        const source = new DeletableTree<string, number>(Option.some(0));
        source.ensure(
            ['1'],
            () => 1,
            () => -1
        );
        source.ensure(
            ['1', '2'],
            () => 12,
            () => -1
        );
        source.ensure(
            ['2'],
            () => 2,
            () => -1
        );
        source.delete(['1']);

        expect([...source.traverse()].sort(sortByAbsolutePath)).toEqual(
            [
                { absolutePath: [], value: 0 },
                { absolutePath: ['2'], value: 2 },
            ].sort(sortByAbsolutePath)
        );
    });
});
