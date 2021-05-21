/* eslint-disable @typescript-eslint/no-namespace */
type ServerTransformParameters<T> = {
    first: { oldValue: T; newValue: T } | undefined;
    second: { newValue: T } | undefined;
    prevState: T;
}
type ServerTransformResult<T> = { oldValue: T; newValue: T } | undefined;

type ClientTransformParameters<T> = {
    first: { newValue: T } | undefined;
    second: { newValue: T } | undefined;
}
type ClientTransformResult<T> = {
    firstPrime: { newValue: T } | undefined;
    secondPrime: { newValue: T } | undefined;
};

export type ReplaceValueTwoWayOperation<T> = {
    oldValue: T;
    newValue: T;
}

export const composeDownOperation = <T>(first: { oldValue: T } | undefined, second: { oldValue: T } | undefined): { oldValue: T } | undefined => {
    if (first === undefined) {
        return second;
    }
    if (second === undefined) {
        return first;
    }
    return { oldValue: first.oldValue };
};

export const composeUpOperation = <T>(first: { newValue: T } | undefined, second: { newValue: T } | undefined): { newValue: T } | undefined => {
    if (first === undefined) {
        return second;
    }
    if (second === undefined) {
        return first;
    }
    return { newValue: first.newValue };
};

export const serverTransform = <T>({ first, second, prevState }: ServerTransformParameters<T>): ServerTransformResult<T> => {
    if (first === undefined && second !== undefined) {
        const newOperation = { oldValue: prevState, newValue: second.newValue };
        if (newOperation.oldValue !== newOperation.newValue) {
            return { oldValue: prevState, newValue: second.newValue };
        }
    }
    return undefined;
};

export const clientTransform = <T>({ first, second }: ClientTransformParameters<T>): ClientTransformResult<T> => {
    return {
        firstPrime: first,
        secondPrime: second,
    };
};

export const toPrivateClientOperation = <T>({
    oldValue,
    newValue,
    defaultState,
    createdByMe,
}: {
    oldValue: {
        isValuePrivate: boolean;
        value: T;
    };
    newValue: {
        isValuePrivate: boolean;
        value: T;
    };
    defaultState: T;
    createdByMe: boolean;
}): { newValue: T } | undefined => {
    if (oldValue.isValuePrivate && !createdByMe) {
        if (newValue.isValuePrivate && !createdByMe) {
            return undefined;
        }
        return {
            newValue: newValue.value,
        };
    }
    if (newValue.isValuePrivate && !createdByMe) {
        return {
            newValue: defaultState,
        };
    }
    return {
        newValue: newValue.value,
    };
};