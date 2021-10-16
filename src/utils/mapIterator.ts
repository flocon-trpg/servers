export function* mapIterator<T1, T2>(source: IterableIterator<T1>, mapping: (x: T1) => T2) {
    for (const elem of source) {
        yield mapping(elem);
    }
}
