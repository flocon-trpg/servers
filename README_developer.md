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
┃ ┣ 📦 default-pino-transport
┃ ┣ 📦 eslint-config
┃ ┣ 📦 flocon-script
┃ ┣ 📦 prettier-config
┃ ┣ 📦 rollup-config
┃ ┣ 📦 sdk
┃ ┣ 📦 sdk-react
┃ ┣ 📦 sdk-urql
┃ ┣ 📦 tsconfig
┃ ┣ 📦 typed-document-node
┃ ┣ 📦 utils
┃ ┗ 📦 web-server-utils
┣ 📄 README_developer.md (このファイル)
┗ ……
```

ビルドやテストは、全体で行うことも、特定のパッケージのみに対して行うこともできます。例えば、この Markdown ファイルがあるディレクトリで`yarn run build`を実行すると、全パッケージがビルドされます。`./packages/core`に移動してから`yarn run build`を実行すると、`core`パッケージとそれに依存するパッケージのみがビルドされます。

現時点では watch スクリプトはありません。ご了承ください。

## 必要動作環境

(Netlify や fly.io にデプロイする場合は必要ありません)

-   yarn のインストール(corepack を有効化している場合は、corepack によって自動的にインストールされます)
-   Node.js v18, v20 のいずれかのインストール

## husky のインストール

Flocon は [husky](https://typicode.github.io/husky) を用いて [https://www.npmjs.com/package/@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli) によるコミットメッセージの自動チェックを行う機能がありますが、husky のインストールは自動的には行われません。インストールするには、この Markdown ファイルがあるディレクトリで `yarn install-husky` を手動で実行する必要があります。

Flocon リポジトリへの Pull Request の作成を考えていない場合、husky のインストールは必要ありません。また、Pull Request を作成する予定がある場合でも husky のインストールは任意です。

## ローカルでの API サーバーの実行方法

[環境変数のセット](https://flocon.app/docs/server/details/api-server/vars)が必須です。また、環境変数のセットにおいて、Firebase プロジェクトの準備も必要になります。

データベースとして PostgreSQL もしくは MySQL を使う場合は対応するデータベースサーバーを起動しておく必要があります。SQLite の場合は不要です。

`main` ブランチから checkout した場合は、次のコマンドを実行しておく必要があります。このコマンドでは TypeScript コードをコンパイルして JavaScript コードの生成が行われます。他のブランチ(`main-build`、`release` など)ではコンパイル済みの JavaScript コードが同梱しているためこのコマンドの実行は不要です。

```console
cd ./apps/api-server
yarn run build
```

API サーバーを動かすには、次のコマンドを実行してください。

```console
cd ./apps/api-server
yarn run start
```

## ローカルでの Web サーバーの実行方法

[環境変数のセット](https://flocon.app/docs/server/details/web-server/vars)が必須です。また、環境変数のセットにおいて、Firebase プロジェクトの準備も必要になります。

`main` ブランチから checkout した場合は、API サーバーと同様に TypeScript コードのコンパイルが必要なため、次のコマンドを実行しておく必要があります。

```console
cd ./apps/web-server
yarn run build:deps
```

Web サーバーを動かすには、次のコマンドを実行してください。

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
yarn run storybook
```

## テストの実行

テストの実行方法には次の 2 つがあります。

-   Github Actions（[act は services に対応していない](https://github.com/nektos/act/issues/173)ため使えません）
-   ローカルで実行

このドキュメントではローカルで実行する方法を説明します。

### クイックスタート

一例として、次のコマンドを実行することで、全てのパッケージをテストできます。

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

## licenses-npm-package.txt の生成に関して

[licenses-npm-package.txt](./apps/web-server/public/licenses-npm-package.txt) は `yarn run generate-disclaimer` で生成できます。

これに使われている yarn プラグインの [plugin-licenses.cjs](./.yarn/plugins/@yarnpkg/plugin-licenses.cjs) は、[yarn-plugin-licenses](https://github.com/mhassan1/yarn-plugin-licenses) から fork した独自のプラグインです。ソースコードは [https://github.com/flocon-trpg/yarn-plugin-licenses](https://github.com/flocon-trpg/yarn-plugin-licenses) にあります。

## ブランチ名について

※ 現在採用しているフローおよびブランチ名は暫定です。

-   `main`: 開発ブランチです。Flocon の TypeScript ソースコードからコンパイルされた JavaScript コードは含まれていません(`.gitignore` に含まれている `dist/` によって git からは無視されます)。
-   `main-build`: `main` ブランチと似ていますが、コンパイルされた JavaScript コードが含まれている点が異なります。`main` ブランチに push があった場合、GitHub Actions によって自動的にビルドされた後に `main-build` ブランチにも push されます。手動で `main-build` ブランチに直接 push することは通常はありません。
-   `prerelease/v*.*.*`: 重要度の高いバグ修正を含んだリリースの前段階となるブランチです。\* には数値等が入ります。必ずしも存在するとは限りません。コンパイルされた JavaScript コードが含まれます。通常は `main-build` ブランチから pull request が作成され、merge されます。
-   `release`: リリース済みのコード置き場です。コンパイルされた JavaScript コードが含まれます。通常は `prerelease/v*.*.*` もしくは `main-build` ブランチから pull request が作成され、merge されます。

### リリースまでの流れ

`release`ブランチにマージされたコードがリリースされます[^2]。基本的には`main`ブランチからマージされます。ただし、重要度の高いバグ修正をリリースしたいが`main`ブランチがまだ不安定でマージできない場合は、代わりに`release`ブランチから`prerelease/v*.*.*`ブランチを切り、そのバグ修正をコミットして、`release`ブランチにマージしてリリースします。バグ修正の内容を`main`ブランチに反映させるため、そちらにもマージします。

[^1]: グローバルインストールする yarn のバージョンは v1 で構いません。詳細は <https://www.wantedly.com/companies/wantedly/post_articles/325643> のポイント 3 を参照してください。

[^2]: 正確にはタグの push によって自動リリースされます。
