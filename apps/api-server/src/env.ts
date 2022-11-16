import { existsSync } from 'fs';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

export const loadDotenv = (): void => {
    // web-server(next.js)と近い仕様にするように、.env.localもサポートしている。
    // ちなみに、npmのdotenvのreadmeには「.envはコミットするな」「.env系のファイルは1つにまとめろ」と書かれている ( https://github.com/motdotla/dotenv/blob/27dfd3f034ce00b1daa72effbd91dd7788aced48/README.md#faq ) が、next.js、create-react-app、またおそらくnpmのdotenvの元となったRubygems版dotenvにはその規則は存在しないため、問題ないという判断をしている。
    const dotenvFiles = ['.env.local', '.env'];

    dotenvFiles.forEach(dotenvFile => {
        if (existsSync(dotenvFile)) {
            expand(
                config({
                    path: dotenvFile,
                })
            );
        }
    });
};

// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const ACCESS_CONTROL_ALLOW_ORIGIN = 'ACCESS_CONTROL_ALLOW_ORIGIN';
export const AUTO_MIGRATION = 'AUTO_MIGRATION';
export const DATABASE_URL = 'DATABASE_URL';
export const EMBUPLOADER_ENABLED = 'EMBUPLOADER_ENABLED';
export const EMBUPLOADER_MAX_SIZE = 'EMBUPLOADER_MAX_SIZE';
export const EMBUPLOADER_SIZE_QUOTA = 'EMBUPLOADER_SIZE_QUOTA';
export const EMBUPLOADER_COUNT_QUOTA = 'EMBUPLOADER_COUNT_QUOTA';
export const EMBUPLOADER_PATH = 'EMBUPLOADER_PATH';
export const ENTRY_PASSWORD = 'ENTRY_PASSWORD';
/**  `FIREBASE_PROJECT_ID` と取り違えないよう注意してください。 */
export const FIREBASE_PROJECTID = 'FIREBASE_PROJECTID';
/**  `FIREBASE_PROJECTID` と取り違えないよう注意してください。 */
export const FIREBASE_PROJECT_ID = 'FIREBASE_PROJECT_ID';
export const FIREBASE_ADMIN_SECRET = 'FIREBASE_ADMIN_SECRET';
export const FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL =
    'FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL';
export const FLOCON_ADMIN = 'FLOCON_ADMIN';
export const HEROKU = 'HEROKU';
export const LOG_FORMAT = 'LOG_FORMAT';
export const LOG_LEVEL = 'LOG_LEVEL';
export const MYSQL = 'MYSQL';
export const POSTGRESQL = 'POSTGRESQL';
export const ROOMHIST_COUNT = 'ROOMHIST_COUNT';
export const SQLITE = 'SQLITE';
