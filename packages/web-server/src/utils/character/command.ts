import { testCommand as testCommandCore } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { transform } from 'sucrase';

const transpile = (script: string): Result<string> => {
    let transpiled: string;
    try {
        transpiled = transform(script, { transforms: ['typescript'] }).code;
    } catch (e: unknown) {
        if (e instanceof Error) {
            return Result.error(e.message);
        }
        throw e;
    }
    return Result.ok(transpiled);
};

export const testCommand = (script: string): Result<undefined> => {
    const transpiled = transpile(script);
    if (transpiled.isError) {
        return transpiled;
    }
    const result = testCommandCore(transpiled.value);
    if (result.isError) {
        return Result.error(result.error.message);
    }
    return Result.ok(undefined);
};
