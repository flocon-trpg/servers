import { groupJoin as groupJoinSet } from './Set';
import { both } from './Types';

const errorMessages = {
    indexOutOfRange: 'index out of range',
    notInteger: 'not integer',
};

class $Iterator<T> {
    public constructor(private readonly iterate: () => IterableIterator<T>) { }

    private toAsync(iterateSync: () => IterableIterator<T>): $AsyncIterator<T> {
        async function* iterate() {
            for (const elem of iterateSync()) {
                yield elem;
            }
        }
        return new $AsyncIterator(iterate);
    }

    public compact<TResult>(mapping: (element: T, index: number) => TResult | null | undefined): $Iterator<Exclude<TResult, null | undefined>> {
        return this.flatMap((elem, index) => {
            const result = mapping(elem, index);
            if (result == null) {
                return [];
            }
            return [result] as Exclude<TResult, null | undefined>[];
        });
    }

    public compactAsync<TResult>(mapping: (element: T, index: number) => PromiseLike<TResult | null | undefined>) {
        return this.toAsync(this.iterate).compactAsync(mapping);
    }

    public count(): number {
        let result = 0;
        for (const _ of this.iterate()) {
            result++;
        }
        return result;
    }

    public some(predicate: (elem: T, index: number) => boolean): boolean {
        return this.find(predicate) !== undefined;
    }

    public filter(predicate: (element: T, index: number) => boolean): $Iterator<T> {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                if (predicate(elem, index)) {
                    yield elem;
                }
                index++;
            }
        }
        return new $Iterator(iterate);
    }

    public find(predicate: (elem: T, index: number) => boolean): { index: number; value: T } | undefined {
        let index = 0;
        for (const elem of this.iterate()) {
            if (predicate(elem, index)) {
                return { index, value: elem };
            }
            index++;
        }
        return undefined;
    }

    public flatMap<TResult>(mapping: (element: T, index: number) => TResult[]): $Iterator<TResult> {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                yield* mapping(elem, index);
                index++;
            }
        }
        return new $Iterator(iterate);
    }

    public forEach(action: (element: T) => void): void {
        for (const elem of this.iterate()) {
            action(elem);
        }
    }

    public map<TResult>(mapping: (element: T, index: number) => TResult): $Iterator<TResult> {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                yield mapping(elem, index);
                index++;
            }
        }
        return new $Iterator(iterate);
    }

    public mapAsync<TResult>(mapping: (element: T, index: number) => PromiseLike<TResult>) {
        return this.toAsync(this.iterate).mapAsync(mapping);
    }

    public reduce<TResult>(mapping: (seed: TResult, element: T, index: number) => TResult, seed: TResult): TResult {
        let result = seed;
        let index = 0;
        for (const elem of this.iterate()) {
            result = mapping(result, elem, index);
            index++;
        }
        return result;
    }

    public reduceAsync<TResult>(mapping: (seed: TResult, element: T, index: number) => PromiseLike<TResult>, seed: TResult) {
        return this.toAsync(this.iterate).reduceAsync(mapping, seed);
    }

    private skipAndTake(skipCount: number, thenTakeCount?: number): $Iterator<T> {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                if (skipCount <= index) {
                    if (thenTakeCount == null || index < (skipCount + thenTakeCount)) {
                        yield elem;
                    }
                }
                index++;
            }
        }
        return new $Iterator(iterate);
    }

    public skip(count: number): $Iterator<T> {
        return this.skipAndTake(count, undefined);
    }

    public take(count: number): $Iterator<T> {
        return this.skipAndTake(0, count);
    }

    public toArray(): T[] {
        return [...this.iterate()];
    }

    public toSet(): Set<T> {
        return new Set(this.iterate());
    }

    public toMap<TKey, TValue>(mapping: (source: T) => { key: TKey; value: TValue }): Map<TKey, TValue> {
        const result = new Map<TKey, TValue>();
        for (const elem of this.iterate()) {
            const { key, value } = mapping(elem);
            result.set(key, value);
        }
        return result;
    }

    public toMapAsync<TKey, TValue>(mapping: (source: T) => Promise<{ key: TKey; value: TValue }>) {
        return this.toAsync(this.iterate).toMapAsync(mapping);
    }
}

class $AsyncIterator<T> {
    public constructor(private readonly iterateAsync: () => AsyncIterableIterator<T>) { }

    public compactAsync<TResult>(mapping: (element: T, index: number) => PromiseLike<TResult | null | undefined>): $AsyncIterator<Exclude<TResult, null | undefined>> {
        const baseIterate = this.iterateAsync;
        async function* iterateAsync() {
            let index = 0;
            for await (const elem of baseIterate()) {
                const value = await mapping(elem, index);
                if (value == null) {
                    continue;
                }
                yield value as Exclude<TResult, null | undefined>;
                index++;
            }
        }
        return new $AsyncIterator(iterateAsync);
    }

    public mapAsync<TResult>(mapping: (element: T, index: number) => PromiseLike<TResult>): $AsyncIterator<TResult> {
        const baseIterate = this.iterateAsync;
        async function* iterate() {
            let index = 0;
            for await (const elem of baseIterate()) {
                yield await mapping(elem, index);
                index++;
            }
        }
        return new $AsyncIterator(iterate);
    }

    public async reduceAsync<TResult>(mapping: (seed: TResult, element: T, index: number) => PromiseLike<TResult>, seed: TResult): Promise<TResult> {
        let result = seed;
        let index = 0;
        for await (const elem of this.iterateAsync()) {
            result = await mapping(result, elem, index);
            index++;
        }
        return result;
    }

    public async toArrayAsync(): Promise<T[]> {
        const result: T[] = [];
        for await (const x of this.iterateAsync()) {
            result.push(x);
        }
        return result;
    }

    public async toMapAsync<TKey, TValue>(mapping: (source: T) => PromiseLike<{ key: TKey; value: TValue }>): Promise<Map<TKey, TValue>> {
        const result = new Map<TKey, TValue>();
        for await (const elem of this.iterateAsync()) {
            const { key, value } = await mapping(elem);
            result.set(key, value);
        }
        return result;
    }
}

class $ReadonlyArray<T> extends $Iterator<T> {
    public constructor(private readonly source: ReadonlyArray<T>) {
        super(() => source.values());
    }

    public count(): number {
        return this.source.length;
    }

    public elementAt(index: number): T {
        if (!Number.isInteger(index)) {
            throw errorMessages.notInteger;
        }
        if (index < this.source.length) {
            return this.source[index];
        }
        throw errorMessages.indexOutOfRange;
    }

    public elementAtOrDefault<TDefault>(index: number, defaultValue: TDefault): T | TDefault {
        if (!Number.isInteger(index)) {
            throw errorMessages.notInteger;
        }
        if (index < this.source.length) {
            return this.source[index];
        }
        return defaultValue;
    }

    public elementAtOrUndefined(index: number): T | undefined {
        return this.elementAtOrDefault(index, undefined);
    }

    public async findOrUndefinedAsync(predicateAsync: (element: T) => Promise<boolean>): Promise<T | undefined> {
        for (const element of this.source) {
            if (await predicateAsync(element)) {
                return element;
            }
        }
        return undefined;
    }

    public first(): T {
        if (this.source.length === 0) {
            throw 'array is empty.';
        }
        return this.source[0];
    }

    public firstOrDefault<TDefault>(defaultValue: TDefault): T | TDefault {
        if (this.source.length === 0) {
            return defaultValue;
        }
        return this.source[0];
    }

    public last(): T {
        if (this.source.length === 0) {
            throw 'array is empty.';
        }
        return this.source[this.source.length - 1];
    }

    public lastOrDefault<TDefault>(defaultValue: TDefault): T | TDefault {
        if (this.source.length === 0) {
            return defaultValue;
        }
        return this.source[this.source.length - 1];
    }

    public single(): T {
        if (this.source.length !== 1) {
            throw 'array.length !== 1';
        }
        return this.source[0];
    }

    public get value() {
        return this.source;
    }
}

class $ReadonlySet<T> extends $Iterator<T> {
    public constructor(private readonly source: ReadonlySet<T>) {
        super(() => source.values());
    }

    public count(): number {
        return this.source.size;
    }

    public groupJoin(right: ReadonlySet<T> | $ReadonlySet<T>) {
        const rightSource = right instanceof $ReadonlySet ? right.source : right;
        return groupJoinSet(this.source, rightSource);
    }

    public equal(another: ReadonlySet<T> | $ReadonlySet<T>) {
        for (const [, value] of this.groupJoin(another)) {
            if (value !== both) {
                return false;
            }
        }
        return true;
    }

    public single(): T {
        if (this.source.size !== 1) {
            throw 'array.size !== 1';
        }
        return [...this.source][0];
    }

    public get value() {
        return this.source;
    }
}

class $ReadonlyMap<TKey, TValue> extends $Iterator<[TKey, TValue]> {
    public constructor(private readonly source: ReadonlyMap<TKey, TValue>) {
        // TODO: 配列をクローンするので非効率
        super(() => [...source].values());
    }

    public mapToArray<TResult>(mapping: (params: { key: TKey; value: TValue }) => TResult): TResult[] {
        const result: TResult[] = [];
        this.source.forEach((value, key) => {
            result.push(mapping({ key, value }));
        });
        return result;
    }

    public forAll(predicate: (params: { key: TKey; value: TValue }) => boolean): boolean {
        for (const [key, value] of this.source) {
            if (!predicate({ key, value })) {
                return false;
            }
        }
        return true;
    }
}

/*
lodash風のライブラリなので、当初は_にしようと思ったが、jestが@babel/coreに依存し、@babel/coreがlodashに依存しているため、lodashの_と被ってしまう。そのため、代わりに__を使うことにした。
$はVS codeがjQueryと勘違いしてしまいimportを手動で行う必要があるため却下。
*/
/*
{ [Symbol.iterator](): AsyncIterableIterator<TValue> }は、{ [Symbol.iterator](): IterableIterator<TValue> }と区別する方法が思い浮かばなかったので、引数として受けつけないようになっている。
*/
export function __<TValue>(source: ReadonlyArray<TValue> | Array<TValue> | $ReadonlyArray<TValue>): $ReadonlyArray<TValue>;
export function __<TValue>(source: ReadonlySet<TValue> | Set<TValue> | $ReadonlySet<TValue>): $ReadonlySet<TValue>;
export function __<TKey, TValue>(source: ReadonlyMap<TKey, TValue> | Map<TKey, TValue> | $ReadonlyMap<TKey, TValue>): $ReadonlyMap<TKey, TValue>;
export function __<TValue>(source: { [Symbol.iterator](): IterableIterator<TValue> } | $Iterator<TValue>): $Iterator<TValue>;
export function __<TKey, TValue>(source: { [Symbol.iterator](): IterableIterator<TValue> } |
$Iterator<TValue> |
ReadonlyArray<TValue> |
$ReadonlyArray<TValue> |
ReadonlySet<TValue> |
$ReadonlySet<TValue> |
ReadonlyMap<TKey, TValue> |
$ReadonlyMap<TKey, TValue>):
    $Iterator<TValue> |
    $ReadonlyArray<TValue> |
    $ReadonlySet<TValue> |
    $ReadonlyMap<TKey, TValue> {
    if (source instanceof $ReadonlyArray) {
        return source;
    }
    if (source instanceof $ReadonlyMap) {
        return source;
    }
    if (source instanceof $ReadonlySet) {
        return source;
    }
    if (source instanceof $Iterator) {
        return source;
    }
    if ('get' in source) {
        return new $ReadonlyMap(source);
    }
    if ('size' in source) {
        return new $ReadonlySet(source);
    }
    if ('length' in source) {
        return new $ReadonlyArray(source);
    }
    return new $Iterator(() => source[Symbol.iterator]());
}

export function range(from: number, count: number): $Iterator<number> {
    function* iterate() {
        for (let i = 0; i < count; i++) {
            yield from + i;
        }
    }
    return new $Iterator(iterate);
}