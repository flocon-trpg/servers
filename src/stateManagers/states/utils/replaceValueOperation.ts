export const ReplaceValueOperationModule = {
    compose<T>(first: { newValue: T } | null | undefined, second: { newValue: T } | null | undefined): { newValue: T } | undefined {
        if (first == null) {
            return second ?? undefined;
        }
        if (second == null) {
            return first ?? undefined;
        }
        return { newValue: second.newValue };
    },
};

export const ReplaceNullableValueOperationModule = {
    compose<T>(first: { newValue?: T | null } | null | undefined, second: { newValue?: T | null } | null | undefined): { newValue?: T } | undefined {
        if (first == null) {
            return { newValue: second?.newValue ?? undefined };
        }
        if (second == null) {
            return { newValue: first?.newValue ?? undefined };
        }
        return { newValue: second.newValue ?? undefined };
    },
};