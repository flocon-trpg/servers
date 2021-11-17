import { config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { existsSync } from 'fs';

export const loadDotenv = (): void => {
    // web-server(next.js)と近い仕様にさせて混乱を防ぐ狙いで、.env.localもサポートしている。
    // ちなみに、npmのdotenvのreadmeには「.envはコミットするな」「.env系のファイルは1つにまとめろ」と書かれている ( https://github.com/motdotla/dotenv/blob/27dfd3f034ce00b1daa72effbd91dd7788aced48/README.md#faq ) が、next.js、create-react-app、またおそらくnpmのdotenvの元となったRubygems版dotenvにはその規則は存在しないため、問題ないという判断をしている。
    const dotenvFiles = ['.env.local', '.env'].flatMap(x => (x == null ? [] : [x]));

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
