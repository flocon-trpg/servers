import { both, GroupJoinResult, left, right } from './Types';

export type DualKey<T1, T2> = {
    readonly first: T1;
    readonly second: T2;
}

export const dualKeyToString = <T1, T2>(source: DualKey<T1, T2>): string => {
    return `${source.first}@${source.second}`;
};

export const toJSONString = <T1, T2>(source: DualKey<T1, T2>): string => {
    return `{ first: ${source.first}, second: ${source.second} }`;
};

export type DualKeyMapSource<TKey1, TKey2, TValue> = Map<TKey1, Map<TKey2, TValue>> | Map<TKey1, ReadonlyMap<TKey2, TValue>> | ReadonlyMap<TKey1, Map<TKey2, TValue>> | ReadonlyMap<TKey1, ReadonlyMap<TKey2, TValue>>;

export class DualKeyMap<TKey1, TKey2, TValue> {
    private _core: Map<TKey1, Map<TKey2, TValue>>;

    public constructor(sourceMap?: DualKeyMapSource<TKey1, TKey2, TValue>) {
        if (sourceMap != null) {
            this._core = DualKeyMap.mapMap(sourceMap, x => x);
            return;
        }
        this._core = new Map<TKey1, Map<TKey2, TValue>>();
    }

    private static mapMap<TKey1, TKey2, TValue1, TValue2>(source: DualKeyMapSource<TKey1, TKey2, TValue1>, mapping: (source: TValue1) => TValue2): Map<TKey1, Map<TKey2, TValue2>> {
        const result = new Map<TKey1, Map<TKey2, TValue2>>();
        for (const [firstKey, first] of source) {
            const toSet = new Map<TKey2, TValue2>();
            for (const [secondKey, second] of first) {
                toSet.set(secondKey, mapping(second));
            }
            result.set(firstKey, toSet);
        }
        return result;
    }

    private static create<TKey1, TKey2, TValue1, TValue2>(source: DualKeyMapSource<TKey1, TKey2, TValue1> | DualKeyMap<TKey1, TKey2, TValue1>, mapping: (source: TValue1) => TValue2): DualKeyMap<TKey1, TKey2, TValue2> {
        const result = new DualKeyMap<TKey1, TKey2, TValue2>();
        result._core = DualKeyMap.mapMap(source instanceof DualKeyMap ? source._core : source, mapping);
        return result;
    }

    public map<TResult>(mapping: (source: TValue) => TResult): DualKeyMap<TKey1, TKey2, TResult> {
        return DualKeyMap.create(this, mapping);
    }

    public clone(): DualKeyMap<TKey1, TKey2, TValue> {
        return DualKeyMap.create(this, x => x);
    }

    public get({ first, second }: DualKey<TKey1, TKey2>): TValue | undefined {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return undefined;
        }
        return inner.get(second);
    }

    public getByFirst(first: TKey1): Map<TKey2, TValue> | undefined {
        return this._core.get(first);
    }

    public set({ first, second }: DualKey<TKey1, TKey2>, value: TValue): DualKeyMap<TKey1, TKey2, TValue> {
        let inner = this._core.get(first);
        if (inner === undefined) {
            inner = new Map<TKey2, TValue>();
            this._core.set(first, inner);
        }
        inner.set(second, value);
        return this;
    }

    public delete({ first, second }: DualKey<TKey1, TKey2>): boolean {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return false;
        }
        const result = inner.delete(second);
        if (inner.size === 0) {
            this._core.delete(first);
        }
        return result;
    }

    public has(key: DualKey<TKey1, TKey2>): boolean {
        return this.get(key) !== undefined;
    }

    *[Symbol.iterator](): IterableIterator<readonly [DualKey<TKey1, TKey2>, TValue]> {
        for (const [firstKey, first] of this._core) {
            for (const [secondKey, second] of first) {
                yield [{ first: firstKey, second: secondKey }, second] as const;
            }
        }
    }

    public toArray() {
        return [...this];
    }

    public toMap() {
        return DualKeyMap.mapMap(this._core, x => x);
    }

    public get size(): number {
        return this.toArray().length;
    }

    public get isEmpty(): boolean {
        return this.size === 0;
    }

    public forEach(action: (value: TValue, key: DualKey<TKey1, TKey2>) => void): void {
        for (const [key, value] of this) {
            action(value, key);
        }
    }

    public reduce<TResult>(reducer: (seed: TResult, element: TValue, key: DualKey<TKey1, TKey2>) => TResult, seed: TResult): TResult {
        let result = seed;
        this.forEach((element, key) => result = reducer(result, element, key));
        return result;
    }

    // 主な使用目的はデバッグのために文字列化させるため
    public toJSON(): string {
        return JSON.stringify([...this._core]);
    }
}

export type ReadonlyDualKeyMap<TKey1, TKey2, TValue> = Omit<Readonly<DualKeyMap<TKey1, TKey2, TValue>>, 'set' | 'delete'> & {
    [Symbol.iterator](): IterableIterator<readonly [DualKey<TKey1, TKey2>, TValue]>;
}

export const groupJoin = <TKey1, TKey2, TLeft, TRight>(left: ReadonlyDualKeyMap<TKey1, TKey2, TLeft>, right: ReadonlyDualKeyMap<TKey1, TKey2, TRight>): DualKeyMap<TKey1, TKey2, GroupJoinResult<TLeft, TRight>> => {
    const result = new DualKeyMap<TKey1, TKey2, GroupJoinResult<TLeft, TRight>>();
    const rightClone = right.clone();
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, { type: 'both', left: leftElement, right: rightElement });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};

// [undefined, undefined, undefined]が返されることはない
export const groupJoin3 = <TKey1, TKey2, T1, T2, T3>(source1: ReadonlyDualKeyMap<TKey1, TKey2, T1>, source2: ReadonlyDualKeyMap<TKey1, TKey2, T2>, source3: ReadonlyDualKeyMap<TKey1, TKey2, T3>): DualKeyMap<TKey1, TKey2, readonly [T1 | undefined, T2 | undefined, T3 | undefined]> => {
    const source = groupJoin(source1, groupJoin(source2, source3));
    return source.map(group => {
        switch (group.type) {
            case left:
                return [group.left, undefined, undefined];
            case right:
            case both: {
                const result1 = (() => {
                    if (group.type === both) {
                        return group.left;
                    }
                    return undefined;
                })();
                switch (group.right.type) {
                    case left:
                        return [result1, group.right.left, undefined];
                    case right:
                        return [result1, undefined, group.right.right];
                    case both:
                        return [result1, group.right.left, group.right.right];
                }
            }
        }
    });
};

// [undefined, undefined, undefined, undefined]が返されることはない
export const groupJoin4 = <TKey1, TKey2, T1, T2, T3, T4>(source1: ReadonlyDualKeyMap<TKey1, TKey2, T1>, source2: ReadonlyDualKeyMap<TKey1, TKey2, T2>, source3: ReadonlyDualKeyMap<TKey1, TKey2, T3>, source4: ReadonlyDualKeyMap<TKey1, TKey2, T4>): DualKeyMap<TKey1, TKey2, readonly [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined]> => {
    const source = groupJoin(groupJoin3(source1, source2, source3), source4);
    return source.map(group => {
        switch (group.type) {
            case left:
                return [...group.left, undefined];
            case right:
                return [undefined, undefined, undefined, group.right];
            case both: {
                return [...group.left, group.right];
            }
        }
    });
};