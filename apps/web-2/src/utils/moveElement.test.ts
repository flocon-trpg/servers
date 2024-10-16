import { moveElement } from './moveElement';

const numberToString = (source: number): string => {
    switch (source) {
        case 1:
            return 'one';
        case 2:
            return 'two';
        case 3:
            return 'three';
        case 4:
            return 'four';
        default:
            throw new Error();
    }
};

describe('moveElement', () => {
    it.each([1, 2, 3, 4])('%i as id', i => {
        const actual = moveElement([1, 2, 3, 4], numberToString, {
            from: numberToString(i),
            to: numberToString(i),
        });
        expect(actual).toEqual([1, 2, 3, 4]);
    });

    it('2 → 3', () => {
        const actual = moveElement([1, 2, 3, 4], numberToString, { from: 'two', to: 'three' });
        expect(actual).toEqual([1, 3, 2, 4]);
    });

    it('3 → 2', () => {
        const actual = moveElement([1, 2, 3, 4], numberToString, { from: 'three', to: 'two' });
        expect(actual).toEqual([1, 3, 2, 4]);
    });

    it('1 → 4', () => {
        const actual = moveElement([1, 2, 3, 4], numberToString, { from: 'one', to: 'four' });
        expect(actual).toEqual([2, 3, 4, 1]);
    });

    it('4 → 1', () => {
        const actual = moveElement([1, 2, 3, 4], numberToString, { from: 'four', to: 'one' });
        expect(actual).toEqual([4, 1, 2, 3]);
    });

    it('tests []', () => {
        const actual = moveElement([], numberToString, { from: 'a', to: 'b' });
        expect(actual).toBeNull();
    });

    it.each`
        from     | to
        ${'one'} | ${'ten'}
        ${'ten'} | ${'one'}
        ${'ten'} | ${'eleven'}
    `('$from → $to', ({ from, to }) => {
        const actual = moveElement([1, 2, 3, 4], numberToString, { from, to });
        expect(actual).toBeNull();
    });

    it.each`
        nullish
        ${null}
        ${undefined}
    `('tests nullish($nullish) value', ({ nullish }) => {
        const actual = moveElement(
            [1, nullish, 3],
            x => (x == null ? 'nullish' : numberToString(x)),
            {
                from: 'nullish',
                to: 'three',
            },
        );
        expect(actual).toEqual([1, 3, nullish]);
    });
});
