import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import fs from 'fs-extra';
import WebPackageJson from '../../web-server/package.json';
import { VERSION } from './VERSION';

// timezone プラグインを使う場合は utc プラグインも必要らしい - https://day.js.org/docs/en/timezone/timezone
dayjs.extend(utc);
dayjs.extend(timezone);

const main = (): void => {
    // API サーバーのバージョンは @flocon-trpg/api-server の TypeScript コードから取得する必要がある一方で、それ以外のバージョンは TypeScript コードを必要としない。そのため、これは API サーバー以外のタグ名も全て生成するスクリプトではあるが、@flocon-trpg/api-server 内に置いている。

    const version = VERSION.toString();
    const apiServerTag = `api/v${version}`;
    const webServerTag = `web/v${WebPackageJson.version}`;

    // GitHub Actions などで実行されることがあるため、明示的にタイムゾーンを指定している
    const date = dayjs().tz('Asia/Tokyo').format('YY.M.D');

    // * の部分は同じ日時に複数のタグがあるときに区別するのが目的の数値。この部分は自動的には生成できないので自分で手動で入力する
    const mainTag = `v${date}.*`;

    const txt = `Main: ${mainTag} 
Web Server: ${webServerTag}
API Server: ${apiServerTag}`;

    fs.writeFileSync('./git-tags.txt', txt);
};

main();
