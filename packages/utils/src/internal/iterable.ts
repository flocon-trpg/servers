import { Option } from '@kizahasi/option';

export function* mapIterable<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => T2) {
    for (const elem of source) {
        yield mapping(elem);
    }
}

export function* chooseIterable<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => Option<T2>) {
    for (const elem of source) {
        const newValue = mapping(elem);
        if (!newValue.isNone) {
            yield newValue.value;
        }
    }
}

export function* pairwiseIterable<T>(source: Iterable<T>) {
    let prev: T | undefined = undefined;
    for (const elem of source) {
        yield { prev, current: elem };
        prev = elem;
    }
}
