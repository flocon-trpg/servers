export type Some<T> = {
    hasValue: true;
    value: T;
}

export type None = {
    hasValue: false;
}

export type Option<T> = Some<T> | None;

export const OptionModule = {
    some: <T>(value: T): Some<T> => ({ hasValue: true, value }),
    none: ({ hasValue: false }) as None,
    get: <T>(source: Option<T>): T => {
        if (!source.hasValue) {
            throw 'not hasValue';
        }
        return source.value;
    },
};