---
title: "ソースコードからビルドして設置"
sidebar_position: 3
---

# ソースコードから API サーバーを設置する

## 必要環境

OS は Ubuntu Server 20.04 x64 で動作確認しています。他の Linux ディストリビューションや、Windows、macOS でもおそらく動くと思いますが、[bcryptパッケージ](https://www.npmjs.com/package/bcrypt)などの影響で追加の作業が必要になる可能性があります。

API サーバーの稼働自体は Google Compute Engine の E2-micro 程度のスペックでも可能ですが、npm パッケージのインストールにはメモリ 1 ～ 2GB 程度が必要になることが確認されています。メモリが少ない場合、一時的にスワップ領域の割り当てなどを行うか、Docker イメージからの起動等を検討してください。

## セットアップ方法

ここで解説する作業はサーバー上で行ってください。

Node.js の [LTS もしくは Maintenance](https://github.com/nodejs/Release#release-schedule) に該当するバージョン(2022年11月現在、v18 が LTS フェーズ、v16 と v14 が Maintenance フェーズです)をインストールしてください。インストールが完了したら、下のコマンドを実行してインストールできているか確認します。

```console
$ node --version
```

また、npm もインストールできているかどうかを次のコマンドで確認します。通常は Node.js と一緒にインストールされます。

```console
$ npm --version
```

次のコマンドで yarn をインストールします。

```console
$ npm install -g yarn
```

<!--
:::note
このコマンドによりインストールされる yarn のバージョンは v1 です。Flocon には yarn v3 が採用されていますが、yarn v3 を別途インストールする必要はありません。Flocon のディレクトリ内で yarn を実行すると、yarn v3 のコードが自動的にロードされ、v3 として動作します(`yarn --version` の実行結果が、Flocon のディレクトリ内外で異なることからも確認できます)。これは Flocon 独自の機能ではなく、yarn v2 以上では一般的な挙動です。
:::
-->

:::note
Flocon は yarn のみに対応しています。npm や pnpm などには対応していません。
:::

必要であれば、API サーバーのソースコードをダウンロードするディレクトリに移動します。

API サーバーのソースコードをダウンロードします。様々な方法がありますが、ここでは `git clone` を用いてダウンロードする方法を解説します。git をインストールした後、次のコマンドを実行して GitHub からソースコードをダウンロードします。なお、この例では `-b` には `release` ブランチを指定していますが、代わりにタグを指定することもできます。

```console
$ git clone https://github.com/flocon-trpg/servers.git -b release --depth 1
```

:::note
`main`ブランチは開発用ブランチであるため、開発者以外の利用は推奨されません。
:::

ダウンロードが完了したら、`servers/apps/api-server` に移動します。

```console
$ cd servers/apps/api-server
```

次のコマンドを実行して、必要な npm パッケージをインストールします。なお、これには合計 600MB 程度のストレージ空き容量が必要です。また、これには数分から十数分程度の時間がかかることがあります。

```console
$ yarn workspaces focus
```

:::note
`yarn workspaces focus` の代わりに `yarn install` を実行しても構いません。ただし、`yarn install` の場合は Web サーバーのみに使用される npm パッケージもインストールされるため、ストレージの使用量が増加します。
:::

:::tip
[`.yarnrc.yml`](https://github.com/flocon-trpg/servers/blob/main/.yarnrc.yml) ファイルを編集して yarn PnP モードを有効化することで、ストレージの消費量を節約することもできます。設定は `yarn workspaces focus` もしくは `yarn install` を実行することで反映されます。 
:::

:::info
v0.7.10 以前では npm パッケージのインストールの次に `yarn run build` を実行する必要がありましたが、v0.7.11 以降ではビルドされたファイルが付属するようになったため実行する必要はなくなりました。
:::

`servers/apps/api-server`ディレクトリ内に`.env.local` ファイルを作成して、[環境変数](../vars)のページを参照して API サーバーの設定情報を入力して保存します。

API サーバーを動かすにはデータベースのマイグレーションを事前に行う必要があります。手動でデータベースのマイグレーションを行う場合は、次のコマンドを実行します（環境変数の `AUTO_MIGRATION` を有効化している場合はこの作業は必要ありません）。

```console
$ yarn run migration-up
```

次のコマンドを実行して、サーバーが正常に稼働するかどうか確認します。

```
$ yarn run start
```

これで API サーバーの導入は完了です。

なお、通常は systemctl などを用いて API サーバープログラムが自動的に起動されるように設定すると思いますが、その設定に関してはここでは省略します。

また、Certbot などを使用して常時 SSL 化することも推奨します。
