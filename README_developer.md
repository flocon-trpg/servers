# 開発者向け Readme

ローカル環境で動かす場合、yarn のインストールが必須となります。npm や pnpm には対応していません。

Flocon は yarn v3[^1] のワークスペースを採用しています。パッケージ 📦 の一覧は次のとおりです。

```
Flocon
┣ 📂 apps
┃ ┣ 📦 api-server
┃ ┗ 📦 web-server
┣ 📂 packages
┃ ┣ 📦 cache
┃ ┣ 📦 core
┃ ┣ 📦 flocon-script
┃ ┣ 📦 typed-document-node-v0.7.1
┃ ┣ 📦 typed-document-node-v0.7.2
┃ ┣ 📦 typed-document-node-v0.7.8
┃ ┣ 📦 utils
┃ ┗ 📦 web-server-utils
┣ 📄 README_developer.md (このファイル)
┗ ……
```

ビルドやテストは、全体で行うことも、特定のパッケージのみに対して行うこともできます。例えば、この Markdown ファイルがあるディレクトリで`yarn run build`を実行すると全パッケージがビルドされます。`./packages/core`に移動してから`yarn run build`を実行すると`core`パッケージとそれに依存するパッケージのみがビルドされます。

`web-server`パッケージを除き、使用するパッケージはすべて事前にビルドして JavaScript ファイルなどを生成しておく必要があります。前述のとおり、この Markdown ファイルがあるディレクトリで`yarn run build`を実行すれば全パッケージがビルドされるので、ビルドに関しては少なくともこれを実行しておけば間違いはありません。このドキュメントは、これ以降、依存するパッケージは全てビルド済みという前提で書かれています。

現時点では watch スクリプトはありません。ご了承ください。

## ローカルでの API サーバーの実行方法

[環境変数のセット](https://flocon.app/docs/server/details/api-server/vars)が必須です。また、環境変数のセットにおいて、Firebase プロジェクトの準備も必要になります。

データベースとして PostgreSQL もしくは MySQL を使う場合は対応するデータベースサーバーを起動しておく必要があります。SQLite の場合は不要です。

```console
cd ./apps/api-server
yarn run start
```

## ローカルでの Web サーバーの実行方法

[環境変数のセット](https://flocon.app/docs/server/details/web-server/vars)が必須です。また、環境変数のセットにおいて、Firebase プロジェクトの準備も必要になります。

開発用サーバーを動かす場合:

```console
cd ./apps/web-server
yarn run dev
```

静的ファイルを利用せずに本番サーバーを動かす場合:

```console
cd ./apps/web-server
yarn run start
```

静的ファイルを利用して本番サーバーを動かす場合:

```console
cd ./apps/web-server
yarn run export
yarn run serve
```

## Storybook

### Chromatic

[Chromatic](https://www.chromatic.com/builds?appId=6295927dd01382004606db92)

### ローカルで実行

```console
cd ./apps/web-server
yarn run build:deps && yarn run storybook
```

## テストの実行

テストの実行方法には次の 2 つがあります。

-   Github Actions（[act は services に対応していない](https://github.com/nektos/act/issues/173)ため使えません）
-   ローカルで実行

このドキュメントではローカルで実行する方法を説明します。

### クイックスタート

Node.js v16 以降をインストールし、次のコマンドを実行することで、全てのパッケージをテストできます。

#### Linux

```console
yarn run build
REDIS_TEST=0 MYSQL_TEST=0 POSTGRESQL_TEST=0 yarn run test
```

#### Powershell

```powershell
yarn run build
$env:REDIS_TEST=0
$env:MYSQL_TEST=0
$env:POSTGRESQL_TEST=0
yarn run test
```

### 詳細

パッケージのディレクトリ内で`yarn run test`を実行することで、パッケージ単体をテストすることもできます。

#### 環境変数

`REDIS_TEST`に falsy な値をセットすることで Redis を使用したテストをスキップできます。Redis を使用したテストを実行する場合は Redis サーバーを起動しておく必要があります。

Redis を使用したテストは`./packages/cache`パッケージにのみ存在します。このパッケージをテストしない場合は`REDIS_TEST`の値は利用されません。現時点では Flocon の Web サーバーと API サーバーでは Redis を使っていないため、Redis を使用したテストは基本的にスキップして構いません。

`MYSQL_TEST`、`POSTGRESQL_TEST`、`SQLITE_TEST`に falsy な値をセットすることで、それぞれのリレーショナルデータベースを使用したテストをスキップできます。MySQL や PostgreSQL を使用したテストを実行する場合は、それぞれのデータベースを準備しておく必要があります。SQLite は事前の準備は必要ありません。

テストに使われるデータベースの URL は [./apps/api-server/test/utils/databaseConfig.ts](./apps/api-server/test/utils/databaseConfig.ts) に記述されています。databaseConfig.ts を編集してテストしても構いません。

リレーショナルデータベースを使用したテストは [api-server](./apps/api-server) パッケージにのみ存在します。このパッケージをテストしない場合は`MYSQL_TEST`、`POSTGRESQL_TEST`、`SQLITE_TEST`の値は利用されません。

#### Node.js 14 以前における web-server パッケージのテスト

`web-server` のコードには String.prototype.replaceAll メソッドが含まれています。このメソッドは多くのブラウザや Node.js 16 などでは対応していますが、Node.js 14 などでは未対応です。このため、Node.js 14 では web-server パッケージの一部のテストに失敗します。なお、Node.js 14 で問題が生じるのはテストのみであり、`yarn run dev`、`yarn run build`、`yarn run export` などは正常に動作すると思われます。

## ブランチ名について

※ 現在採用しているフローおよびブランチ名は暫定です。

-   `main`: 開発ブランチです。
-   `release`: リリース済みのコード置き場です。
-   `prerelease/v*.*.*`: 重要度の高いバグ修正を含んだリリースの前段階となるブランチです。\*には数値等が入ります。必ずしも存在するとは限りません。

### リリースまでの流れ

`release`ブランチにマージされたコードがリリースされます[^2]。基本的には`main`ブランチからマージされます。ただし、重要度の高いバグ修正をリリースしたいが`main`ブランチがまだ不安定でマージできない場合は、代わりに`release`ブランチから`prerelease/v*.*.*`ブランチを切り、そのバグ修正をコミットして、`release`ブランチにマージしてリリースします。バグ修正の内容を`main`ブランチに反映させるため、そちらにもマージします。

[^1]: グローバルインストールする yarn のバージョンは v1 で構いません。詳細は <https://www.wantedly.com/companies/wantedly/post_articles/325643> のポイント 3 を参照してください。
[^2]: 正確にはタグの push によって自動リリースされます。
