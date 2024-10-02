// 自動的に昇順にソートされる配列。
export class SortedArray<T> {
    #core: { value: T; sortKey: number }[];

    public constructor(
        readonly createSortKey: (value: T) => number,
        init?: readonly T[]
    ) {
        if (init == null) {
            this.#core = [];
            return;
        }
        this.#core = init.map(value => ({ value, sortKey: createSortKey(value) }));
        this.#core.sort((x, y) => x.sortKey - y.sortKey);
    }

    public clone() {
        const result = new SortedArray(this.createSortKey);
        result.#core = [...this.#core];
        return result;
    }

    // 挿入先が末尾に近いほど高速で、先頭に近いほど低速。
    // CONSIDER: バイナリサーチなどで高速化できる。
    public add(newValue: T): void {
        const sortKeyOfNewValue = this.createSortKey(newValue);

        for (let i = this.#core.length - 1; i >= 0; i--) {
            const element = this.#core[i];
            if (element == null) {
                throw new Error('This should not happen');
            }

            if (element.sortKey <= sortKeyOfNewValue) {
                const index = i + 1;
                this.#core.splice(index, 0, { value: newValue, sortKey: sortKeyOfNewValue });
                return;
            }
        }
        const index = 0;
        this.#core.splice(index, 0, { value: newValue, sortKey: sortKeyOfNewValue });
    }

    // 該当する要素の位置が末尾に近いほど高速で、先頭に近いほど低速。ただし見つからなかった場合は最も遅い。
    // CONSIDER: バイナリサーチなどで高速化できる。
    #findIndexFromEnd(predicate: (value: T) => boolean): number {
        for (let i = this.#core.length - 1; i >= 0; i--) {
            const element = this.#core[i];
            if (element == null) {
                throw new Error('This should not happen');
            }
            if (predicate(element.value)) {
                return i;
            }
        }
        return -1;
    }

    #removeLast(predicate: (value: T) => boolean): T | undefined {
        const index = this.#findIndexFromEnd(predicate);
        if (index < 0) {
            return undefined;
        }
        const found = this.#core[index];
        if (found == null) {
            throw new Error('This should not happen');
        }
        this.#core.splice(index, 1);
        return found.value;
    }

    public updateLast(
        update: (oldValue: T) => T | undefined
    ): { oldValue: T; newValue: T } | undefined {
        let newValue: T | undefined = undefined;
        const found = this.#removeLast(elem => {
            const result = update(elem);
            if (result === undefined) {
                return false;
            }
            newValue = result;
            return true;
        });
        if (found === undefined || newValue === undefined) {
            return undefined;
        }
        this.add(newValue);
        return { oldValue: found, newValue };
    }

    public toArray<T2>(mapFilter: (value: T) => T2 | undefined): T2[] {
        return this.#core.flatMap(elem => {
            const newValue = mapFilter(elem.value);
            if (newValue === undefined) {
                return [];
            }
            return [newValue];
        });
    }

    public clear(): void {
        this.#core = [];
    }

    public createFiltered(filter: (value: T) => boolean) {
        return FilteredSortedArray.ofSortedKey(this, filter);
    }
}

export class FilteredSortedArray<T> {
    private constructor(
        private readonly filter: (value: T) => boolean,
        private readonly base: SortedArray<{ value: T; exists: boolean }>
    ) {}

    public clone() {
        const result = new FilteredSortedArray(this.filter, this.base.clone());
        return result;
    }

    public static ofArray<T>(
        base: readonly T[],
        filter: (value: T) => boolean,
        createSortKey: (value: T) => number
    ) {
        const b = new SortedArray(
            x => createSortKey(x.value),
            base.map(x => ({ value: x, exists: filter(x) }))
        );
        return new FilteredSortedArray<T>(filter, b);
    }

    public static ofSortedKey<T>(base: SortedArray<T>, filter: (value: T) => boolean) {
        const b = new SortedArray(
            x => base.createSortKey(x.value),
            base.toArray(x => ({ value: x, exists: filter(x) }))
        );
        return new FilteredSortedArray<T>(filter, b);
    }

    public toArray<T2>(mapFilter: (value: T) => T2 | undefined): T2[] {
        return this.base.toArray(elem => {
            if (!elem.exists) {
                return undefined;
            }
            return mapFilter(elem.value);
        });
    }

    public clear(): void {
        this.base.clear();
    }

    public add(newValue: T): boolean {
        const exists = this.filter(newValue);
        this.base.add({ value: newValue, exists });
        return exists;
    }

    public updateLast(
        update: (oldValue: T) => T | undefined
    ): { oldValue: T | undefined; newValue: T | undefined } | undefined {
        const found = this.base.updateLast(elem => {
            const newValue = update(elem.value);
            if (newValue === undefined) {
                return undefined;
            }
            return {
                value: newValue,
                exists: this.filter(newValue),
            };
        });
        if (found == null) {
            return undefined;
        }
        return {
            oldValue: found.oldValue.exists ? found.oldValue.value : undefined,
            newValue: found.newValue.exists ? found.newValue.value : undefined,
        };
    }
}
