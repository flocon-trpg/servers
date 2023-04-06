import { mapIterable } from './iterable';
import { MultiKeyMap } from './multiKeyMap';

/** 複数の値を使用できるSet */
export class MultiValueSet<T> {
    #core = new MultiKeyMap<T, boolean>();

    public add(key: readonly T[]) {
        return this.#core.set(key, true);
    }

    public has(key: readonly T[]): boolean {
        return this.#core.get(key) ?? false;
    }

    public delete(key: readonly T[]) {
        this.#core.delete(key);
    }

    public get size(): number {
        return [...this.#core.traverse()].filter(({ value }) => value).length;
    }

    public toIterator(): Iterable<readonly T[]> {
        return mapIterable(this.#core.traverse(), elem => elem.absolutePath);
    }

    public clone(): MultiValueSet<T> {
        const result = new MultiValueSet<T>();
        result.#core = this.#core.map(x => x.value);
        return result;
    }
}
