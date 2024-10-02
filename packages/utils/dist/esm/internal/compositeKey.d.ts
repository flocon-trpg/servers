export type CompositeKey = {
    id: string;
    createdBy: string;
};
export declare const stringToCompositeKey: (source: string) => CompositeKey | null;
export declare const compositeKeyToJsonString: (source: CompositeKey) => string;
export declare const compositeKeyEquals: (x: CompositeKey, y: CompositeKey) => boolean;
//# sourceMappingURL=compositeKey.d.ts.map