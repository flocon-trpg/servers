---
title: "静的ファイルを生成して設置"
sidebar_position: 2
---

[リリース一覧](https://github.com/flocon-trpg/servers/releases)にある`flocon_web_server.zip`[^1] に相当するファイルを生成する方法についての解説です。この解説の方法を用いることで、静的ファイルに環境変数などのデータを埋め込むなどといった機能を使うことができますが、基本的には`flocon_web_server.zip`を使用するほうが簡単であるためそちらを推奨します。

## ビルド方法

まず、Node.js の [LTS もしくは Maintenance](https://github.com/nodejs/Release#release-schedule) に該当するバージョンと、yarn をインストールしてください。

:::note
Flocon は npm や pnpm には対応していないため、yarn は必須です。
:::

API サーバーのソースコードをダウンロードします。様々な方法がありますが、ここでは `git clone` を用いてダウンロードする方法を解説します。下のコマンドを実行して GitHub からソースコードをダウンロードします。なお、この例では `-b` には `release` ブランチを指定していますが、代わりにタグを指定することもできます。

```console
$ git clone https://github.com/flocon-trpg/servers.git -b release --depth 1
```

ダウンロードされた `server` フォルダはリネームしたり別の場所に移動しても構いません。ただし、パスに全角文字が含まれているとエラーが出ることがあるため、全角文字を含まないようにすることを推奨します。

`server/apps/web-server` フォルダ内で `.env.local` ファイルを作成します。

:::info
`.env.local`ではなく環境変数や`env.txt`を用いて設定することも可能です。これらを併用して別々に設定することも可能です。これらの違いは、`.env.local`と環境変数で設定した内容（Next.js の機能に従うため、`NEXT_PUBLIC_`から始まらないものは無視されます）は`yarn run export`を実行したときに生成される静的ファイルの JavaScript ファイルなどに埋め込まれますが、`env.txt`の内容は埋め込まれないという点です。
:::

作成した `.env.local` ファイルをメモ帳で開き、[web-server 設定ツール](https://tools.flocon.app/web-server)を利用して変数を書き込んで保存します。あくまで一例としてですが、`.env.local` ファイルは最終的に下のようになります。

```env
NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"***","authDomain":"***.firebaseapp.com","databaseURL":"https://***.firebaseio.com","projectId":"***","storageBucket":"***.appspot.com","messagingSenderId":"***","appId":"***"}'
NEXT_PUBLIC_API_HTTP=https://example.com
NEXT_PUBLIC_API_WS=wss://example.com
NEXT_PUBLIC_AUTH_PROVIDERS=email,google
NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED=true
```

`server/apps/web-server` フォルダ内で次のコマンドを実行して、必要なパッケージをインストールします。なお、これには合計 1GB 程度の空きストレージ容量が必要です。また、これには数分から十数分程度の時間がかかることがあります。

```bash
$ yarn workspaces focus
```

:::note
`yarn workspaces focus`の代わりに`yarn install`などを実行しても構いません。ですが`yarn install`では API サーバーに必要なパッケージもインストールしようとするため、環境によっては [bcrypt](https://www.npmjs.com/package/bcrypt) パッケージなどのインストールに失敗します。そのため`yarn workspaces focus`のほうが無難だと思われます。
:::

次のコマンドを実行して、静的ファイルを作成します。これには数分から十数分程度の時間がかかることがあります。

```bash
$ yarn run export
```

:::info
パスに全角文字が含まれる状態で`yarn workspaces focus`などを実行していた場合、`yarn run build`を実行すると`The command failed for workspaces that are depended upon by other workspaces; can't satisfy the dependency graph`というエラーが出て失敗することがあります。この場合は、パスに全角文字を含まないようにしてから`servers`フォルダにある`node_modules`フォルダを削除して、`yarn workspaces focus`を実行するところからやり直してください。
:::

`out`フォルダが生成されます。この中には HTML ファイル、画像ファイル、JavaScript ファイルなどといった静的ファイルが入っています。これをオンプレミスサーバーで利用するかホスティングサービス(Netlify や Firebase Hosting など様々なものがあります)などにアップロードすることで Web サーバーの設置が完了します。

:::caution
生成された`out`フォルダと`.next`フォルダ内のファイルには、一部の環境変数や `.env.local`ファイルのデータが埋め込まれています。そのため、これらのファイルを第三者と共有することは推奨されません。
:::

[^1]: 古いバージョンでは `web-server-static.zip` という名前です。