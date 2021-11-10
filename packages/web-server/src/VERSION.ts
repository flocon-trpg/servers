import { beta, SemVer } from '@flocon-trpg/utils';
import * as packageJson from '../package.json';

/* セキュリティ向上を目的としたversionの非表示はしていない。理由は下のとおり。
- バージョン情報がなくとも、各種ファイルを解析するなどによりバージョンの推定はおそらく可能。
- 攻撃者は、バージョンを確認せずにあらゆる攻撃スクリプトをダメ元で試していくことも十分に考えられる。
- web-serverは静的ファイルを配布するだけのサーバーである。そのため、api-serverに対する攻撃は考えられるが、web-serverに対する攻撃が効果的とは思えない。もし攻撃可能であればそれはweb-serverのコードよりはサーバーの設定（もしくはVercelなどのホスティングサイト）の問題であり、web-serverのバージョンは関係ない。
- 例えば特定のバージョンのweb-serverにXSSなどの脆弱性がある場合を考える。そのバージョンでサーバーを構築して他のユーザーを誘導して攻撃するといったケースでは、バージョンを隠す意味がない。悪意のない第三者によって構築されたことが明らかだが放置されたweb-serverに誘導して攻撃するケースの場合は、バージョンが表示されないことが逆にデメリットになりうる。
*/
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
        if (
            expectedElement.major === actual.major &&
            SemVer.compare(expectedElement, '<=', actual)
        ) {
            return true;
        }
    }
    return false;
};
