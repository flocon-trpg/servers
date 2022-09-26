type ServerTransformParameters<T> = {
    first: { oldValue: T; newValue: T } | undefined;
    second: { newValue: T } | undefined;
    prevState: T;
};
type ServerTransformResult<T> = { oldValue: T; newValue: T } | undefined;

export type ReplaceValueTwoWayOperation<T> = {
    oldValue: T;
    newValue: T;
};

export const composeDownOperation = <T>(
    first: { oldValue: T } | undefined,
    second: { oldValue: T } | undefined
): { oldValue: T } | undefined => {
    if (first === undefined) {
        return second;
    }
    if (second === undefined) {
        return first;
    }
    return { oldValue: first.oldValue };
};

export const serverTransform = <T>({
    first,
    second,
    prevState,
}: ServerTransformParameters<T>): ServerTransformResult<T> => {
    if (first === undefined && second !== undefined) {
        const newOperation = { oldValue: prevState, newValue: second.newValue };
        if (newOperation.oldValue !== newOperation.newValue) {
            return { oldValue: prevState, newValue: second.newValue };
        }
    }
    return undefined;
};
