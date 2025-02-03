import { readFileSync } from 'fs';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { z } from 'zod';
import { VERSION } from './VERSION';

let isDayjsExtended = false;

const extendDayjs = () => {
    if (isDayjsExtended) {
        return;
    }

    // timezone プラグインを使う場合は utc プラグインも必要らしい - https://day.js.org/docs/en/timezone/timezone
    dayjs.extend(utc);
    dayjs.extend(timezone);
    isDayjsExtended = true;
};

// API サーバーのバージョンは @flocon-trpg/api-server の TypeScript コードから取得する必要がある一方で、それ以外のバージョンは TypeScript コードを必要としない。そのため、これは API サーバー以外のタグ名も全て生成するスクリプトではあるが、@flocon-trpg/api-server 内に置いている。

export const getApiServerVersion = (): string => {
    return VERSION.toString();
};

export const getApiServerTag = (): string => {
    return `api/v${getApiServerVersion()}`;
};

const packageJsonObject = z.object({ version: z.string() });

export const getWebServerVersion = (): string => {
    // JSON ファイルは TypeScript で import できるが、ビルドしたときのフォルダ構造が変わってしまい nest.js が正常に動作しなくなるので import は使っていない
    const webPackageJsonString = readFileSync('../../web-server/package.json', 'utf-8');
    const webPackageJson: unknown = JSON.parse(webPackageJsonString);
    return packageJsonObject.parse(webPackageJson).version;
};

export const getWebServerTag = (): string => {
    return `web/v${getWebServerVersion()}`;
};

export const getMainTag = (): string => {
    extendDayjs();

    // GitHub Actions などで実行されることがあるため、明示的にタイムゾーンを指定している
    const date = dayjs().tz('Asia/Tokyo').format('YY.M.D');

    // * の部分は同じ日時に複数のタグがあるときに区別するのが目的の数値。この部分は自動的には生成できないので自分で手動で入力する
    return `v${date}.*`;
};
