import Redis from 'ioredis';
type Key = string;
type Value = string | number;
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
export declare const createNodeCache: (config: NodeCacheConfig) => Cache;
export declare const createRedisCache: (config: RedisConfig & {
    redis: Redis;
}) => Cache;
export {};
//# sourceMappingURL=main.d.ts.map