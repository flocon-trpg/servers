export const getRestValues = <T>(iterator: IterableIterator<T>) => {
    const result: T[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const next = iterator.next();
        if (next.done) {
            return result;
        }
        result.push(next.value);
    }
};
