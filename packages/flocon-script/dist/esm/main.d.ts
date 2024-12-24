type ExecResult = {
    result: unknown;
    getGlobalThis(): unknown;
};
export declare const exec: (script: string, globalThis: Record<string, unknown>) => ExecResult;
export declare const test: (script: string) => void;
export {};
//# sourceMappingURL=main.d.ts.map