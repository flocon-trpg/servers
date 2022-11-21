import { arrayEquals } from '..';

describe('arrayEquals', () => {
    it.each([
        { left: [], right: [] },
        { left: [1, 2], right: [1, 2] },
    ])('tests %j to return true', ({ left, right }) => {
        const actual = arrayEquals(left, right);
        expect(actual).toBe(true);
    });

    it.each([
        { left: [], right: [1] },
        { left: [1], right: [] },
        { left: [1, 2], right: [2, 1] },
        { left: [1, 2], right: [1, 2, 3] },
        { left: [1, 2, 3, 4], right: [1, 2, 3] },
    ])('tests %j to return false', ({ left, right }) => {
        const actual = arrayEquals(left, right);
        expect(actual).toBe(false);
    });
});
