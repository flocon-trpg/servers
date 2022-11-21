import { keyNames } from '..';

describe('keyNames', () => {
    it('tests ""', () => {
        expect(keyNames('')).toBe('');
    });

    it('tests "x"', () => {
        expect(keyNames('x')).toBe('x');
    });

    it('tests "{ first: "x", second: "y" }"', () => {
        expect(keyNames({ first: 'x', second: 'y' })).toBe('x@y');
    });

    it('tests "{ createdBy: "x", id: "y" }"', () => {
        expect(keyNames({ createdBy: 'x', id: 'y' })).toBe('x@y');
    });

    it.each`
        key1                           | key2                           | key3
        ${'a'}                         | ${{ first: 'b', second: 'c' }} | ${{ createdBy: 'd', id: 'e' }}
        ${'a'}                         | ${{ createdBy: 'b', id: 'c' }} | ${{ first: 'd', second: 'e' }}
        ${{ first: 'a', second: 'b' }} | ${'c'}                         | ${{ createdBy: 'd', id: 'e' }}
        ${{ first: 'a', second: 'b' }} | ${{ createdBy: 'c', id: 'd' }} | ${'e'}
        ${{ createdBy: 'a', id: 'b' }} | ${'c'}                         | ${{ first: 'd', second: 'e' }}
        ${{ createdBy: 'a', id: 'b' }} | ${{ first: 'c', second: 'd' }} | ${'e'}
    `('tests multiple keys', ({ key1, key2, key3 }) => {
        expect(keyNames(key1, key2, key3)).toBe('a@b@c@d@e');
    });

    it.each([
        { first: 'a', second: 'b', createdBy: 'a', id: 'b' },
        { first: 'a', second: 'b', createdBy: 'c' },
        { first: 'a', second: 'b', id: 'c' },
        { createdBy: 'a', id: 'b', first: 'c' },
        { createdBy: 'a', id: 'b', second: 'c' },
    ])('tests mixed keys', key => {
        expect(keyNames(key)).toBe('a@b');
    });
});
