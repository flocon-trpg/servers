import { beta, SemVer } from '@flocon-trpg/utils';
import * as packageJson from '../package.json';

// セキュリティ向上を目的としたversionの非表示はしていない。理由は下のとおり。
// - バージョン情報がなくとも、各種ファイルを解析するなどによりバージョンの推定はおそらく可能。
// - 攻撃者は、バージョンを確認せずにあらゆる攻撃スクリプトをダメ元で試していくことも十分に考えられる。
// - web-serverは静的ファイルを配布するだけのサーバーである。api-serverに対する攻撃は直接行えるため、わざわざweb-serverを踏み台にする意味がない。
// - 例えば特定のバージョンのweb-serverにXSSなどの脆弱性があり、そのバージョンでサーバーを構築して他のユーザーを誘導して攻撃するといったケースは、そもそも攻撃者がweb-serverのコードを改変できるためバージョンを隠す意味がない。
// - 悪意のない第三者が構築したことが明らかだが放置されたweb-serverに誘導して攻撃するケースの場合は、バージョンが表示されないことが逆にデメリットになりうる。
// - web-serverは将来Discordのように複数のサーバーを利用できるようにする(api-serverの各種Configなどを入力し、IndexedDBなどに保存)可能性がある。そうした場合、公式サーバーとelectronアプリを利用するユーザーが大半となる。公式サーバーは常に最新のバージョンにすることができるため、バージョンが確認できても攻撃材料にはなりづらい。electronアプリの場合はバージョンを隠す意味がない。
export const VERSION = packageJson.version;

// 例えば >=1.2.0 と >=3.0.0 の両方に対応可能なケースも考えられるため、配列を用いている。
export const SupportedApiServers: ReadonlyArray<SemVer> = [
    new SemVer({
        major: 0,
        minor: 1,
        patch: 0,
        prerelease: {
            type: beta,
            version: 1,
        },
    }),
];

export const apiServerSatisfies = ({
    expected,
    actual,
}: {
    expected: ReadonlyArray<SemVer>;
    actual: SemVer;
}): boolean => {
    for (const expectedElement of expected) {
        if (SemVer.compare(expectedElement, '<=', actual)) {
            return true;
        }
    }
    return false;
};
