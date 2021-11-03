import Redis from 'ioredis';
import NodeCacheCore from 'node-cache';

type Key = string;
type Value = string | number;

const stringToNumber = (source: string) => {
    return parseFloat(source);
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt#a_stricter_parse_function
const filterInt = (value: string) => {
    if (/^[-+]?\d+$/.test(value)) {
        return Number(value);
    } else {
        return null;
    }
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
    keys(): Promise<string[]>;
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

    // redisの値はすべてstringであり、INCRは整数のみに実行可能（小数には実行不可）なので、それをなるべく再現している
    public async incrby(key: Key, increment: number) {
        if (!Number.isInteger(increment)) {
            throw new Error('not an integer');
        }

        const value = this.cache.get(key);
        if (value == null) {
            this.cache.set(key, increment);
            return increment;
        }

        let valueAsInt: number | null = null;
        if (typeof value === 'string') {
            valueAsInt = filterInt(value);
        } else if (typeof value === 'number') {
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
        const valueAsString = await this.getAsString(key);
        if (valueAsString == null) {
            return valueAsString;
        }
        return stringToNumber(valueAsString);
    }

    public async set(key: Key, value: Value) {
        let isOk: string | null;
        if (this.config.stdTTL == null) {
            isOk = await this.redis.set(this.key(key), value);
        } else {
            isOk = await this.redis.set(this.key(key), value, 'EX', this.config.stdTTL);
        }
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
