export declare const replace = "replace";
export declare const update = "update";
export type OperationElement<TState, TOperation> = {
    type: typeof replace;
    newValue: TState | undefined;
} | {
    type: typeof update;
    operation: TOperation;
};
//# sourceMappingURL=types.d.ts.map