import { Range } from './range';
export declare class ScriptError extends Error {
    readonly range?: Range | undefined;
    constructor(message?: string, range?: Range | undefined);
    static notConstructorError(range?: Range): ScriptError;
    static requiresNewError(range?: Range): ScriptError;
}
//# sourceMappingURL=ScriptError.d.ts.map