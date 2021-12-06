import { config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { existsSync } from 'fs';

export const loadDotenv = (): void => {
    // web-server(next.js)と近い仕様にさせて混乱を防ぐ狙いで、.env.localもサポートしている。
    // ちなみに、npmのdotenvのreadmeには「.envはコミットするな」「.env系のファイルは1つにまとめろ」と書かれている ( https://github.com/motdotla/dotenv/blob/27dfd3f034ce00b1daa72effbd91dd7788aced48/README.md#faq ) が、next.js、create-react-app、またおそらくnpmのdotenvの元となったRubygems版dotenvにはその規則は存在しないため、問題ないという判断をしている。
    const dotenvFiles = ['.env.local', '.env'];

    dotenvFiles.forEach(dotenvFile => {
        if (existsSync(dotenvFile)) {
            dotenvExpand(
                config({
                    path: dotenvFile,
                })
            );
        }
    });
};

// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const FIREBASE_CONFIG = 'FIREBASE_CONFIG';
export const NEXT_PUBLIC_FIREBASE_CONFIG = 'NEXT_PUBLIC_FIREBASE_CONFIG';
export const FIREBASE_ADMIN_SECRET = 'FIREBASE_ADMIN_SECRET';
export const FLOCON_API_ADMINS = 'FLOCON_API_ADMINS';
export const FLOCON_API_AUTO_MIGRATION = 'FLOCON_API_AUTO_MIGRATION';
export const ENTRY_PASSWORD = 'ENTRY_PASSWORD';
export const ACCESS_CONTROL_ALLOW_ORIGIN = 'ACCESS_CONTROL_ALLOW_ORIGIN';
export const SQLITE = 'SQLITE';
export const POSTGRESQL = 'POSTGRESQL';
export const EMBUPLOADER_ENABLED = 'EMBUPLOADER_PATH';
export const EMBUPLOADER_MAX_FILE_SIZE = 'EMBUPLOADER_MAX_FILE_SIZE';
export const EMBUPLOADER_SIZE_QUOTA = 'EMBUPLOADER_SIZE_QUOTA';
export const EMBUPLOADER_COUNT_QUOTA = 'EMBUPLOADER_COUNT_QUOTA';
export const EMBUPLOADER_PATH = 'EMBUPLOADER_PATH';
export const FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL =
    'FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL';
