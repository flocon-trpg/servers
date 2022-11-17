import { filterInt } from '@flocon-trpg/utils';
import NodeCacheCore from 'node-cache';

const stringToNumber = (source) => {
    return parseFloat(source);
};
class NodeCache {
    cache;
    constructor(config) {
        this.cache = new NodeCacheCore(config);
    }
    async getAsString(key) {
        const result = await this.cache.get(key);
        if (result == null) {
            return null;
        }
        // redisの挙動に近づけるため、numberはstringとなるべく同一視している
        return result.toString();
    }
    async getAsNumber(key) {
        const result = await this.cache.get(key);
        if (result == null) {
            return null;
        }
        if (typeof result === 'number') {
            return result;
        }
        // redisの挙動に近づけるため、こちらでもstringToNumberを用いて変換している
        return stringToNumber(result);
    }
    async set(key, value) {
        return this.cache.set(key, value);
    }
    // redisの値はすべてstringであり、INCRは整数のみに実行可能（小数には実行不可）なので、それをなるべく再現している
    async incrby(key, increment) {
        if (!Number.isInteger(increment)) {
            throw new Error('not an integer');
        }
        const value = this.cache.get(key);
        if (value == null) {
            this.cache.set(key, increment);
            return increment;
        }
        let valueAsInt = null;
        if (typeof value === 'string') {
            valueAsInt = filterInt(value);
        }
        else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                valueAsInt = value;
            }
        }
        if (valueAsInt == null) {
            throw new Error('not an integer');
        }
        const newValue = valueAsInt + increment;
        this.cache.set(key, newValue);
        return newValue;
    }
    async decrby(key, decrement) {
        return this.incrby(key, -decrement);
    }
    async del(key) {
        return this.cache.del(key) !== 0;
    }
    async keys() {
        return this.cache.keys();
    }
}
class RedisCache {
    redis;
    config;
    constructor(redis, config) {
        this.redis = redis;
        this.config = config;
    }
    key(keyArg) {
        return `${this.config.keyPrefix}:${keyArg}`;
    }
    async getAsString(key) {
        return await this.redis.get(this.key(key));
    }
    async getAsNumber(key) {
        const valueAsString = await this.getAsString(key);
        if (valueAsString == null) {
            return valueAsString;
        }
        return stringToNumber(valueAsString);
    }
    async set(key, value) {
        let isOk;
        if (this.config.stdTTL == null) {
            isOk = await this.redis.set(this.key(key), value);
        }
        else {
            isOk = await this.redis.set(this.key(key), value, 'EX', this.config.stdTTL);
        }
        return isOk === 'OK';
    }
    async incrby(key, increment) {
        return this.redis.incrby(this.key(key), increment);
    }
    async decrby(key, decrement) {
        return this.redis.decrby(this.key(key), decrement);
    }
    async del(key) {
        const result = await this.redis.del(this.key(key));
        return result !== 0;
    }
    async keys() {
        return await this.redis.keys(`${this.config.keyPrefix}:*`);
    }
}
const createNodeCache = (config) => {
    return new NodeCache(config);
};
const createRedisCache = (config) => {
    return new RedisCache(config.redis, config);
};

export { createNodeCache, createRedisCache };
