import { Option } from '@kizahasi/option';
export function* map<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => T2) {
    for (const elem of source) {
        yield mapping(elem);
    }
}

export function* reduce<T1, T2>(source: Iterable<T1>, mapping: (source: T1) => Option<T2>) {
    for (const elem of source) {
        const newValue = mapping(elem);
        if (!newValue.isNone) {
            yield newValue.value;
        }
    }
}
