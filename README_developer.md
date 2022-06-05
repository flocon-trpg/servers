# 開発者向け Readme

## サーバー設置方法

サーバー設置方法は[公式サイト](https://flocon.app)をご覧ください。

## Storybook

### Chromatic

[Chromatic](https://www.chromatic.com/builds?appId=6295927dd01382004606db92)

### ローカルで実行

```console
cd ./apps/web-server
yarn run build:deps && yarn run storybook
```

## テストの実行

### クイックスタート

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

テストに使われるデータベースの接続方法は [./apps/api-server/test/utils/databaseConfig.ts](./apps/api-server/test/utils/databaseConfig.ts) にあります。

リレーショナルデータベースを使用したテストは [api-server](./apps/api-server) パッケージにのみ存在します。このパッケージをテストしない場合は`MYSQL_TEST`、`POSTGRESQL_TEST`、`SQLITE_TEST`の値は利用されません。
