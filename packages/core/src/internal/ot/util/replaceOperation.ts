type ServerTransformParameters<T> = {
    first: { oldValue: T; newValue: T } | undefined;
    second: { newValue: T } | undefined;
    prevState: T;
};
type ServerTransformResult<T> = { oldValue: T; newValue: T } | undefined;

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
