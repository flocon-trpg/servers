import { Range } from './range';

export class ScriptError extends Error {
    public constructor(message?: string, public readonly range?: Range) {
        super(message);
    }

    public static notConstructorError(range?: Range) {
        return new ScriptError('Not a constructor', range);
    }
}
