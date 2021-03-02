// .NET の Lazy<T> のようなクラス

export type Lazy<T> = {
    readonly value: T;
}

class LazyImpl<T> implements Lazy<T> {
    private loaded = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private cache: any;

    public constructor(private readonly get: () => T) {}

    public get value(): T {
        if (this.loaded) {
            return this.cache as T;
        }
        const cache: T = this.get();
        this.cache = cache;
        this.loaded = true;
        return cache;
    }
}

export type AsyncLazy<T> = {
    readonly getValue: () => Promise<T>;
}

class AsyncLazyImpl<T> implements AsyncLazy<T> {
    private loaded = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private cache: any;

    public constructor(private readonly getAsync: () => Promise<T>) { }

    public async getValue(): Promise<T> {
        if (this.loaded) {
            return this.cache as T;
        }
        const cache: T = await this.getAsync();
        this.cache = cache;
        this.loaded = true;
        return cache;
    }
}

export const lazy = <T>(get: () => T): Lazy<T> => new LazyImpl(get);
export const asyncLazy = <T>(getAsync: () => Promise<T>): AsyncLazy<T> => new AsyncLazyImpl(getAsync);