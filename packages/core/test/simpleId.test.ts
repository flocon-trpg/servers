import { simpleId } from '../src';

describe('simpleId', () => {
    it('tests length', () => {
        for (let i = 0; i < 1_000_000; i++) {
            const id = simpleId();
            expect(id).toHaveLength(9);
        }
    });

    it('tests randomness', () => {
        const map = new Map<string, number>();
        for (let i = 0; i < 100_000; i++) {
            const id = simpleId();
            const prevCount = map.get(id) ?? 0;
            map.set(id, prevCount + 1);
        }
        map.forEach(count => {
            expect(count).toBeLessThanOrEqual(2);
        });
    });
});
