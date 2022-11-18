import Redis from 'ioredis';
declare type Key = string;
declare type Value = string | number;
declare type NodeCacheConfig = {
    checkperiod?: number;
    stdTTL?: number;
    maxKeys?: number;
};
declare type RedisConfig = {
    keyPrefix: string;
    stdTTL?: number;
};
export declare type Cache = {
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