export const getRestValues = <T>(iterator: IterableIterator<T>) => {
    const result: T[] = [];
    while (true) {
        const next = iterator.next();
        if (next.done) {
            return result;
        }
        result.push(next.value);
    }
};
