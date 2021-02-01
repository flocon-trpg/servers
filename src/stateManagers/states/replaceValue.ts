import { Transform } from '../StateManager';

export type ReplaceValueOperation<T> = { newValue: T };

export const transform = <T>({
    first,
    second
}: {
    first?: ReplaceValueOperation<T> | null | undefined;
    second?: ReplaceValueOperation<T> | null | undefined;
}): {
    firstPrime?: ReplaceValueOperation<T>;
    secondPrime?: ReplaceValueOperation<T>;
} => {
    if (first === undefined) {
        return { secondPrime: second ?? undefined };
    }
    return { firstPrime: first ?? undefined };
};

export type ReplaceNullableValueOperation<T> = { newValue?: T };

export const transformNullable = <T>({
    first,
    second
}: {
    first?: ReplaceNullableValueOperation<T> | null | undefined;
    second?: ReplaceNullableValueOperation<T> | null | undefined;
}): {
    firstPrime?: ReplaceNullableValueOperation<T>;
    secondPrime?: ReplaceNullableValueOperation<T>;
} => {
    if (first === undefined) {
        return { secondPrime: second ?? undefined };
    }
    return { firstPrime: first ?? undefined };
};