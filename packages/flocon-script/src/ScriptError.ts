import { Range } from './range';

export class ScriptError extends Error {
    public constructor(
        message?: string,
        public readonly range?: Range,
    ) {
        super(message);
        this.name = 'ScriptError';
    }

    public static notConstructorError(range?: Range) {
        return new ScriptError('Not a constructor', range);
    }

    public static requiresNewError(range?: Range) {
        return new ScriptError('Need to call with `new` keyword', range);
    }
}
