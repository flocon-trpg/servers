import Redis from 'ioredis';
import NodeCacheCore from 'node-cache';

type Key = string;
type Value = string | number;

const stringToNumber = (source: string) => {
    return parseFloat(source);
};

type NodeCacheConfig = {
    checkperiod?: number;
    stdTTL?: number;
    maxKeys?: number;
};

type RedisConfig = {
    keyPrefix: string;
    stdTTL?: number;
};

export type Cache = {
    getAsString(key: Key): Promise<string | null>;
    getAsNumber(key: Key): Promise<number | null>;
    set(key: Key, value: Value): Promise<boolean>;
    incrby(key: Key, increment: number): Promise<number>;
    decrby(key: Key, decrement: number): Promise<number>;
    del(key: Key): Promise<boolean>;
    keys(key: Key): Promise<string[]>;
};

class NodeCache implements Cache {
    private readonly cache: NodeCacheCore;

    public constructor(config: NodeCacheConfig) {
        this.cache = new NodeCacheCore(config);
    }

    public async getAsString(key: Key) {
        const result: string | number | undefined = await this.cache.get(key);
        if (result == null) {
            return null;
        }
        // redisの挙動に近づけるため、numberはstringとなるべく同一視している
        return result.toString();
    }

    public async getAsNumber(key: Key) {
        const result: string | number | undefined = await this.cache.get(key);
        if (result == null) {
            return null;
        }
        if (typeof result === 'number') {
            return result;
        }
        // redisの挙動に近づけるため、こちらでもstringToNumberを用いて変換している
        return stringToNumber(result);
    }

    public async set(key: Key, value: Value) {
        return this.cache.set(key, value);
    }

    public async incrby(key: Key, increment: number) {
        const value = this.cache.get(key);
        if (value == null) {
            this.cache.set(key, increment);
            return increment;
        }
        if (typeof value !== 'number') {
            throw new Error('not number');
        }
        const newValue = value + increment;
        this.cache.set(key, newValue);
        return newValue;
    }

    public async decrby(key: Key, decrement: number) {
        return this.incrby(key, -decrement);
    }

    public async del(key: Key) {
        return this.cache.del(key) !== 0;
    }

    public async keys() {
        return this.cache.keys();
    }
}

class RedisCache implements Cache {
    public constructor(private readonly redis: Redis.Redis, private readonly config: RedisConfig) {}

    private key(keyArg: string) {
        return `${this.config.keyPrefix}:${keyArg}`;
    }

    public async getAsString(key: Key) {
        return await this.redis.get(this.key(key));
    }

    public async getAsNumber(key: Key) {
        const valueAsString = await this.getAsString(this.key(key));
        if (valueAsString == null) {
            return valueAsString;
        }
        return stringToNumber(valueAsString);
    }

    public async set(key: Key, value: Value) {
        const isOk = await this.redis.set(this.key(key), value, 'EX', this.config.stdTTL);
        return isOk === 'OK';
    }

    public async incrby(key: Key, increment: number) {
        return this.redis.incrby(this.key(key), increment);
    }

    public async decrby(key: Key, decrement: number) {
        return this.redis.decrby(this.key(key), decrement);
    }

    public async del(key: Key) {
        const result = await this.redis.del(this.key(key));
        return result !== 0;
    }

    public async keys() {
        return await this.redis.keys(`${this.config.keyPrefix}:*`);
    }
}

export const createNodeCache = (config: NodeCacheConfig): Cache => {
    return new NodeCache(config);
};

export const createRedisCache = (config: RedisConfig & { redis: Redis.Redis }): Cache => {
    return new RedisCache(config.redis, config);
};
