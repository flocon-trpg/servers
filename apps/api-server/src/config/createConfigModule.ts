import { ConfigModule } from '@nestjs/config';

export const createConfigModule = () =>
    ConfigModule.forRoot({
        // web-server(next.js)と近い仕様にするように、.env.localもサポートしている。
        // ちなみに、npmのdotenvのreadmeには「.envはコミットするな」「.env系のファイルは1つにまとめろ」と書かれている ( https://github.com/motdotla/dotenv/blob/27dfd3f034ce00b1daa72effbd91dd7788aced48/README.md#faq ) が、next.js、create-react-app、またおそらくnpmのdotenvの元となったRubygems版dotenvにはその規則は存在しないため、問題ないという判断をしている。
        envFilePath: ['.env.local', '.env'],
    });
