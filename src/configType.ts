import { maybe } from '@kizahasi/flocon-core';
import * as t from 'io-ts';

export const postgresql = 'postgresql';
export const sqlite = 'sqlite';

const database = t.type({
    postgresql: maybe(
        t.type({
            dbName: t.string,
            clientUrl: t.string,
        })
    ),
    sqlite: maybe(
        t.type({
            dbName: t.string,
        })
    ),
});

export type DatabaseConfig =
    | {
          __type: typeof postgresql;
          dbName: string;
          clientUrl: string;
      }
    | {
          __type: typeof sqlite;
          dbName: string;
      };

const uploader = t.type({
    // false（もしくはuploader == null）ならばFloconアップローダーを無効にする。
    enabled: t.boolean,

    // 1ファイルあたりの最大サイズ。
    // 注意点として、現在のファイルサイズのquotaの仕様では、「もしこのファイルをアップロードしてquotaを超えるようならばアップロードを拒否」ではなく「現在の合計ファイルサイズがquotaを超えているならばどのアップロードも拒否、そうでなければアップロードは許可」となっている（理由は、例えばquotaを100MBに設定していて合計ファイルサイズが99.99MBだったとき、ファイルのアップロードがほぼ常に失敗するため。）。そのため、1ユーザーあたりが保存できるファイルサイズをFとすると、適切な不等式は F < quota ではなく、(F + maxFileSize) < quota となる。 よって、もしmaxFileSizeが大きすぎると、
    maxFileSize: t.number,

    // 1ユーザーが保存できるファイルの合計サイズ。
    sizeQuota: t.number,

    // 1ユーザーが保存できるファイルの合計個数。大量に小さいファイルをアップロードしてサーバーの動作を遅くする攻撃を防ぐ狙いがある。
    countQuota: t.number,

    directory: t.string,
});

export type UploaderConfig = t.TypeOf<typeof uploader>;

export const serverConfigJson = t.type({
    admin: maybe(t.union([t.string, t.array(t.string)])),
    database: database,
    uploader: maybe(uploader),

    // この文字が Access-Control-Allow-Origin と等しくなる。uploaderが有効でapi_serverとweb_serverが同一ドメインでない場合、これを設定しないとアップロードができない。現状、uploaderが有効なときにのみ使われる。キー名を 'Access-Control-Allow-Origin' ではなくcamelCaseにしているのは、「JSONに書いたヘッダーがすべて反映される」という勘違いを防ぐため。
    accessControlAllowOrigin: maybe(t.string),
});

type ServerConfigJson = t.TypeOf<typeof serverConfigJson>;

export type ServerConfig = Omit<ServerConfigJson, 'database'> & {
    database: DatabaseConfig;
};
