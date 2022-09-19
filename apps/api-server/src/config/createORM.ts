import { Result } from '@kizahasi/result';
import { MikroORM } from '@mikro-orm/core';
import { AppConsole } from '../utils/appConsole';
import { ORM } from '../utils/types';
import { createORMOptions } from './createORMOptions';

export const createORM = async (
    options: ReturnType<typeof createORMOptions>
): Promise<Result<ORM>> => {
    if (options.isError) {
        return options;
    }
    try {
        const result = await MikroORM.init(options.value);
        return Result.ok(result);
    } catch (e) {
        AppConsole.error({
            en: 'Could not connect to the database!',
            ja: 'データベースに接続できませんでした',
        });
        // TODO: 適度にcatchする
        throw e;
    }
};
