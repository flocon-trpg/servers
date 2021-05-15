/* eslint-disable @typescript-eslint/no-namespace */
type TransformParameters<T> = {
    first: { oldValue: T; newValue: T } | undefined;
    second: { newValue: T } | undefined;
    prevState: T;
}
type TransformResult<T> = { oldValue: T; newValue: T } | undefined;

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

export const transform = <T>({ first, second, prevState }: TransformParameters<T>): TransformResult<T> => {
    if (first === undefined && second !== undefined) {
        const newOperation = { oldValue: prevState, newValue: second.newValue };
        if (newOperation.oldValue !== newOperation.newValue) {
            return { oldValue: prevState, newValue: second.newValue };
        }
    }
    return undefined;
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