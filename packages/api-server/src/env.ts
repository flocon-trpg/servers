import { config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { existsSync } from 'fs';

export const loadDotenv = (): void => {
    // web-server(next.js)と近い仕様にさせて混乱を防ぐ狙いで、.env.localもサポートしている。
    // ちなみに、npmのdotenvのreadmeには「.envはコミットするな」「.env系のファイルは1つにまとめろ」と書かれている ( https://github.com/motdotla/dotenv/blob/27dfd3f034ce00b1daa72effbd91dd7788aced48/README.md#faq ) が、next.js、create-react-app、またおそらくnpmのdotenvの元となったRubygems版dotenvにはその規則は存在しないため、問題ないという判断をしている。
    const dotenvFiles = ['.env.local', '.env'].flatMap(x => (x == null ? [] : [x]));

    dotenvFiles.forEach(dotenvFile => {
        if (existsSync(dotenvFile)) {
            // bcryptのハッシュなどには$が含まれているため変数展開されそうだが、大丈夫な模様
            dotenvExpand(
                config({
                    path: dotenvFile,
                })
            );
        }
    });
};

export const NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG = 'NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG';
export const FLOCON_API_ADMINS = 'FLOCON_API_ADMINS';
export const FLOCON_API_AUTO_MIGRATION = 'FLOCON_API_AUTO_MIGRATION';
export const FLOCON_API_ENTRY_PASSWORD = 'FLOCON_API_ENTRY_PASSWORD';
export const FLOCON_API_ACCESS_CONTROL_ALLOW_ORIGIN = 'FLOCON_API_ACCESS_CONTROL_ALLOW_ORIGIN';
export const FLOCON_API_SQLITE = 'FLOCON_API_SQLITE';
export const FLOCON_API_POSTGRESQL = 'FLOCON_API_POSTGRESQL';
export const FLOCON_API_EMBEDDED_UPLOADER_MAX_FILE_SIZE =
    'FLOCON_API_EMBEDDED_UPLOADER_MAX_FILE_SIZE';
export const FLOCON_API_EMBEDDED_UPLOADER_SIZE_QUOTA = 'FLOCON_API_EMBEDDED_UPLOADER_SIZE_QUOTA';
export const FLOCON_API_EMBEDDED_UPLOADER_COUNT_QUOTA = 'FLOCON_API_EMBEDDED_UPLOADER_COUNT_QUOTA';
export const FLOCON_API_EMBEDDED_UPLOADER_PATH = 'FLOCON_API_EMBEDDED_UPLOADER_PATH';
export const FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL =
    'FLOCON_API_DISABLE_RATE_LIMIT_EXPERIMENTAL';
