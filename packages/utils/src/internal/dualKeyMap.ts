import { Option } from '@kizahasi/option';
import { mapToRecord } from './record';
import { GroupJoinResult, both, left, right } from './types';

export type DualKey<T1, T2> = {
    readonly first: T1;
    readonly second: T2;
};

export type DualKeyMapSource<TKey1, TKey2, TValue> =
    | Map<TKey1, Map<TKey2, TValue>>
    | Map<TKey1, ReadonlyMap<TKey2, TValue>>
    | ReadonlyMap<TKey1, Map<TKey2, TValue>>
    | ReadonlyMap<TKey1, ReadonlyMap<TKey2, TValue>>;

type RecordKey = string | number | symbol;

export class DualKeyMap<TKey1, TKey2, TValue> {
    // Map<TKey2, TValue>は常に空でないMapとなる
    private _core: Map<TKey1, Map<TKey2, TValue>>;

    public constructor(sourceMap?: DualKeyMapSource<TKey1, TKey2, TValue>) {
        if (sourceMap != null) {
            this._core = DualKeyMap.chooseMap(sourceMap, x => Option.some(x));
            return;
        }
        this._core = new Map<TKey1, Map<TKey2, TValue>>();
    }

    private static chooseMap<TKey1, TKey2, TValue1, TValue2>(
        source: DualKeyMapSource<TKey1, TKey2, TValue1>,
        chooser: (source: TValue1, key: DualKey<TKey1, TKey2>) => Option<TValue2>,
    ): Map<TKey1, Map<TKey2, TValue2>> {
        const result = new Map<TKey1, Map<TKey2, TValue2>>();
        for (const [firstKey, first] of source) {
            if (first.size === 0) {
                continue;
            }
            const toSet = new Map<TKey2, TValue2>();
            for (const [secondKey, second] of first) {
                const chooserResult = chooser(second, { first: firstKey, second: secondKey });
                if (chooserResult.isNone) {
                    continue;
                }
                toSet.set(secondKey, chooserResult.value);
            }
            result.set(firstKey, toSet);
        }
        return result;
    }

    private static create<TKey1, TKey2, TValue1, TValue2>(
        source: DualKeyMapSource<TKey1, TKey2, TValue1> | DualKeyMap<TKey1, TKey2, TValue1>,
        chooser: (source: TValue1, key: DualKey<TKey1, TKey2>) => Option<TValue2>,
    ): DualKeyMap<TKey1, TKey2, TValue2> {
        const result = new DualKeyMap<TKey1, TKey2, TValue2>();
        result._core = DualKeyMap.chooseMap(
            source instanceof DualKeyMap ? source._core : source,
            chooser,
        );
        return result;
    }

    public static ofRecord<TKey1 extends RecordKey, TKey2 extends RecordKey, TValue>(
        source: Record<TKey1, Record<TKey2, TValue | undefined> | undefined>,
    ): DualKeyMap<TKey1, TKey2, TValue> {
        const result = new DualKeyMap<TKey1, TKey2, TValue>();
        for (const key1 in source) {
            const inner: Record<TKey2, TValue | undefined> | undefined = source[key1];
            if (inner === undefined) {
                continue;
            }
            for (const key2 in inner) {
                const value: TValue | undefined = inner[key2];
                if (value !== undefined) {
                    result.set({ first: key1, second: key2 }, value);
                }
            }
        }
        return result;
    }

    public map<TResult>(
        mapping: (source: TValue, key: DualKey<TKey1, TKey2>) => TResult,
    ): DualKeyMap<TKey1, TKey2, TResult> {
        return DualKeyMap.create(this, (source, key) => Option.some(mapping(source, key)));
    }

    public choose<TResult>(
        chooser: (source: TValue, key: DualKey<TKey1, TKey2>) => Option<TResult>,
    ): DualKeyMap<TKey1, TKey2, TResult> {
        return DualKeyMap.create(this, (source, key) => chooser(source, key));
    }

    public clone(): DualKeyMap<TKey1, TKey2, TValue> {
        return DualKeyMap.create(this, x => Option.some(x));
    }

    public get({ first, second }: DualKey<TKey1, TKey2>): TValue | undefined {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return undefined;
        }
        return inner.get(second);
    }

    // 戻り値のReadonlyMapをMapにするとDualKeyMapを操作できて一見便利そうだが、そうすると_coreの制約を満たせなくなる。また、ReadonlyMapであれば戻り値がundefinedのときは空のMapを作成して返せるため綺麗になる。
    public getByFirst(first: TKey1): ReadonlyMap<TKey2, TValue> {
        return this._core.get(first) ?? new Map();
    }

    public set(
        { first, second }: DualKey<TKey1, TKey2>,
        value: TValue,
    ): DualKeyMap<TKey1, TKey2, TValue> {
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
        return Array.from(this);
    }

    public toMap() {
        return DualKeyMap.chooseMap(this._core, x => Option.some(x));
    }

    public toStringRecord(
        createStringKey1: (first: TKey1) => string,
        createStringKey2: (second: TKey2) => string,
    ): Record<string, Record<string, TValue>> {
        const result = new Map<string, Record<string, TValue>>();
        this._core.forEach((inner, first) => {
            const innerRecord = new Map<string, TValue>();
            inner.forEach((value, second) => {
                innerRecord.set(createStringKey2(second), value);
            });
            result.set(createStringKey1(first), mapToRecord(innerRecord));
        });
        return mapToRecord(result);
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

    public reduce<TResult>(
        reducer: (seed: TResult, element: TValue, key: DualKey<TKey1, TKey2>) => TResult,
        seed: TResult,
    ): TResult {
        let result = seed;
        this.forEach((element, key) => (result = reducer(result, element, key)));
        return result;
    }

    // 主な使用目的はデバッグ目的で文字列化させるため
    public toJSON(valueToString?: (value: TValue) => string): string {
        return JSON.stringify(
            [...this._core].map(([key1, value]) => [
                key1,
                [...value].map(([key2, value]) => [
                    key2,
                    valueToString === undefined ? value : valueToString(value),
                ]),
            ]),
        );
    }
}

export type ReadonlyDualKeyMap<TKey1, TKey2, TValue> = Omit<
    Readonly<DualKeyMap<TKey1, TKey2, TValue>>,
    'set' | 'delete' | 'getByFirst'
> & {
    [Symbol.iterator](): IterableIterator<readonly [DualKey<TKey1, TKey2>, TValue]>;
    getByFirst(key: TKey1): ReadonlyMap<TKey2, TValue> | undefined;
};

export const groupJoinDualKeyMap = <TKey1, TKey2, TLeft, TRight>(
    left: ReadonlyDualKeyMap<TKey1, TKey2, TLeft>,
    right: ReadonlyDualKeyMap<TKey1, TKey2, TRight>,
): DualKeyMap<TKey1, TKey2, GroupJoinResult<TLeft, TRight>> => {
    const result = new DualKeyMap<TKey1, TKey2, GroupJoinResult<TLeft, TRight>>();
    const rightClone = right.clone();
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, {
            type: 'both',
            left: leftElement,
            right: rightElement,
        });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};

// [undefined, undefined, undefined]が返されることはない
export const groupJoin3DualKeyMap = <TKey1, TKey2, T1, T2, T3>(
    source1: ReadonlyDualKeyMap<TKey1, TKey2, T1>,
    source2: ReadonlyDualKeyMap<TKey1, TKey2, T2>,
    source3: ReadonlyDualKeyMap<TKey1, TKey2, T3>,
): DualKeyMap<TKey1, TKey2, readonly [T1 | undefined, T2 | undefined, T3 | undefined]> => {
    const source = groupJoinDualKeyMap(source1, groupJoinDualKeyMap(source2, source3));
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
export const groupJoin4DualKeyMap = <TKey1, TKey2, T1, T2, T3, T4>(
    source1: ReadonlyDualKeyMap<TKey1, TKey2, T1>,
    source2: ReadonlyDualKeyMap<TKey1, TKey2, T2>,
    source3: ReadonlyDualKeyMap<TKey1, TKey2, T3>,
    source4: ReadonlyDualKeyMap<TKey1, TKey2, T4>,
): DualKeyMap<
    TKey1,
    TKey2,
    readonly [T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined]
> => {
    const source = groupJoinDualKeyMap(groupJoin3DualKeyMap(source1, source2, source3), source4);
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
