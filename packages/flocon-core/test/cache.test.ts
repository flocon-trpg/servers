import { Cache, createNodeCache, createRedisCache, simpleId } from '../src';
import Redis from 'ioredis';

/*
To run tests in this file, you need to prepare a redis instance. If you want to skip redis tests, set TEST_SKIP_REDIS env to "true".
*/

const TEST_SKIP_REDIS = process.env.TEST_SKIP_REDIS;
const skipRedis = TEST_SKIP_REDIS?.toLowerCase() === 'true';

if (skipRedis) {
    console.log('SKIPS Redis tests because `TEST_SKIP_REDIS` is true');
} else {
    console.log('DO Redis tests because `TEST_SKIP_REDIS` is not true');
}

const createEach = (): Cache[] => {
    const result: Cache[] = [];
    result.push(createNodeCache({}));
    if (!skipRedis) {
        result.push(
            createRedisCache({
                keyPrefix: simpleId(),
                redis: new Redis(),
            })
        );
    }
    return result;
};

describe('cache', () => {
    it.each(createEach())('tests get string value (not exists)', async cache => {
        const getResult = await cache.getAsString('KEY');
        expect(getResult).toBeNull();
    });

    it.each(createEach())('tests set and get string value (exists)', async cache => {
        const setResult = await cache.set('KEY', 'VALUE');
        expect(setResult).toBe(true);
        const getResult = await cache.getAsString('KEY');
        expect(getResult).toBe('VALUE');
    });

    it.each(createEach())('tests get number value (not exists)', async cache => {
        const getResult = await cache.getAsNumber('KEY');
        expect(getResult).toBeNull();
    });

    it.each(createEach())('tests set and get number value (exists)', async cache => {
        const setResult = await cache.set('KEY', 17);
        expect(setResult).toBe(true);
        const getResult = await cache.getAsNumber('KEY');
        expect(getResult).toBe(17);
    });

    it.each(createEach())('tests del (not exists)', async cache => {
        const delResult = await cache.del('KEY');
        expect(delResult).toBe(false);
    });

    it.each(createEach())('tests del (exists)', async cache => {
        await cache.set('KEY', 'VALUE');
        const delResult = await cache.del('KEY');
        expect(delResult).toBe(true);
        const getResult = await cache.getAsString('KEY');
        expect(getResult).toBeNull();
    });

    it.each(createEach())('tests incr (not exists)', async cache => {
        const incrResult = await cache.incrby('KEY', 2);
        expect(incrResult).toBe(2);
        const getResult = await cache.getAsNumber('KEY');
        expect(getResult).toBe(2);
    });

    it.each(createEach())('tests incr (exists)', async cache => {
        await cache.set('KEY', 17);
        const incrResult = await cache.incrby('KEY', 2);
        expect(incrResult).toBe(19);
        const getResult = await cache.getAsNumber('KEY');
        expect(getResult).toBe(19);
    });

    it.each(createEach())('tests decr (not exists)', async cache => {
        const decrResult = await cache.decrby('KEY', 2);
        expect(decrResult).toBe(-2);
        const getResult = await cache.getAsNumber('KEY');
        expect(getResult).toBe(-2);
    });

    it.each(createEach())('tests decr (exists)', async cache => {
        await cache.set('KEY', 17);
        const decrResult = await cache.decrby('KEY', 2);
        expect(decrResult).toBe(15);
        const getResult = await cache.getAsNumber('KEY');
        expect(getResult).toBe(15);
    });
});
