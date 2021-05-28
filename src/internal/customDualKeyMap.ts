import {
    DualKey,
    DualKeyMap,
    DualKeyMapSource,
    ReadonlyDualKeyMap,
} from './dualKeyMap';
import * as $DualKeyMap from './dualKeyMap';
import { GroupJoinResult } from './types';

export type KeyFactory<TKey, TKeySource1, TKeySource2> = {
    createKey: (source: DualKey<TKeySource1, TKeySource2>) => TKey;
    createDualKey: (source: TKey) => DualKey<TKeySource1, TKeySource2>;
};

export class CustomDualKeyMap<TKey, TKeySource1, TKeySource2, TValue> {
    private _dualKeyMap: DualKeyMap<TKeySource1, TKeySource2, TValue>;

    public constructor(
        private readonly params: {
            sourceMap?:
                | DualKeyMapSource<TKeySource1, TKeySource2, TValue>
                | DualKeyMap<TKeySource1, TKeySource2, TValue>;
        } & KeyFactory<TKey, TKeySource1, TKeySource2>
    ) {
        if (params.sourceMap instanceof DualKeyMap) {
            this._dualKeyMap = params.sourceMap.clone();
            return;
        }
        this._dualKeyMap = new DualKeyMap<TKeySource1, TKeySource2, TValue>(
            params.sourceMap
        );
    }

    public get dualKeyMap() {
        return this._dualKeyMap;
    }

    public wrap<TResult>(
        dualKeyMap: DualKeyMap<TKeySource1, TKeySource2, TResult>
    ): CustomDualKeyMap<TKey, TKeySource1, TKeySource2, TResult> {
        const result = new CustomDualKeyMap<
            TKey,
            TKeySource1,
            TKeySource2,
            TResult
        >({ ...this.params, sourceMap: undefined });
        result._dualKeyMap = dualKeyMap;
        return result;
    }

    public createKey(source: DualKey<TKeySource1, TKeySource2>): TKey {
        return this.params.createKey(source);
    }

    public createDualKey(source: TKey): DualKey<TKeySource1, TKeySource2> {
        return this.params.createDualKey(source);
    }

    public map<TResult>(
        mapping: (
            source: TValue,
            key: DualKey<TKeySource1, TKeySource2>
        ) => TResult
    ): CustomDualKeyMap<TKey, TKeySource1, TKeySource2, TResult> {
        const result = new CustomDualKeyMap<
            TKey,
            TKeySource1,
            TKeySource2,
            TResult
        >({ ...this.params, sourceMap: undefined });
        result._dualKeyMap = this._dualKeyMap.map(mapping);
        return result;
    }

    public clone(): CustomDualKeyMap<TKey, TKeySource1, TKeySource2, TValue> {
        const result = new CustomDualKeyMap<
            TKey,
            TKeySource1,
            TKeySource2,
            TValue
        >({ ...this.params, sourceMap: undefined });
        result._dualKeyMap = this._dualKeyMap.clone();
        return result;
    }

    public get(key: TKey): TValue | undefined {
        const dualKey = this.params.createDualKey(key);
        return this._dualKeyMap.get(dualKey);
    }

    public getByFirst(
        first: TKeySource1
    ): Map<TKeySource2, TValue> | undefined {
        return this._dualKeyMap.getByFirst(first);
    }

    public set(
        key: TKey,
        value: TValue
    ): CustomDualKeyMap<TKey, TKeySource1, TKeySource2, TValue> {
        const dualKey = this.params.createDualKey(key);
        this._dualKeyMap.set(dualKey, value);
        return this;
    }

    public delete(key: TKey): boolean {
        const dualKey = this.params.createDualKey(key);
        return this._dualKeyMap.delete(dualKey);
    }

    public has(key: TKey): boolean {
        const dualKey = this.params.createDualKey(key);
        return this._dualKeyMap.has(dualKey);
    }

    *[Symbol.iterator](): IterableIterator<readonly [TKey, TValue]> {
        for (const [dualKey, value] of this._dualKeyMap) {
            yield [this.params.createKey(dualKey), value];
        }
    }

    public toArray() {
        return Array.from(this);
    }

    public get size(): number {
        return this.toArray().length;
    }

    public get isEmpty(): boolean {
        return this.size === 0;
    }

    public forEach(action: (value: TValue, key: TKey) => void): void {
        for (const [key, value] of this) {
            action(value, key);
        }
    }

    public reduce<TResult>(
        reducer: (seed: TResult, element: TValue, key: TKey) => TResult,
        seed: TResult
    ): TResult {
        let result = seed;
        this.forEach(
            (element, key) => (result = reducer(result, element, key))
        );
        return result;
    }

    // 主な使用目的はデバッグのために文字列化させるため
    public toJSON(): string {
        return this._dualKeyMap.toJSON();
    }
}

export type ReadonlyCustomDualKeyMap<
    TKey,
    TKeySource1,
    TKeySource2,
    TValue
> = Omit<
    Readonly<CustomDualKeyMap<TKey, TKeySource1, TKeySource2, TValue>>,
    'set' | 'delete' | 'getByFirst' | 'dualKeyMap'
> & {
    [Symbol.iterator](): IterableIterator<readonly [TKey, TValue]>;
    getByFirst(key: TKeySource1): ReadonlyMap<TKeySource2, TValue> | undefined;
    readonly dualKeyMap: ReadonlyDualKeyMap<TKeySource1, TKeySource2, TValue>;
};

// groupJoin系において、createKeyとcreateDualKeyはleftのもののみが使われる。leftとrightで異なるcreateKeyやcreateDualKeyを使用していないという前提。

export const groupJoin = <TKey, TKeySource1, TKeySource2, TLeft, TRight>(
    left: ReadonlyCustomDualKeyMap<TKey, TKeySource1, TKeySource2, TLeft>,
    right: ReadonlyCustomDualKeyMap<TKey, TKeySource1, TKeySource2, TRight>
): CustomDualKeyMap<
    TKey,
    TKeySource1,
    TKeySource2,
    GroupJoinResult<TLeft, TRight>
> => {
    const result = $DualKeyMap.groupJoin(left.dualKeyMap, right.dualKeyMap);
    return new CustomDualKeyMap({ ...left, sourceMap: result });
};
