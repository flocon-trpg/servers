# web-server

**一般的な Web サーバーの設置方法に関しては、このドキュメントではなく <flocon.app> をお読みください。**

## 開発者向けドキュメント

Node.js と yarn のインストールが必要です。

外部パッケージをインストールしていない場合は、`yarn install` 等でインストールします。

web-server パッケージに依存するワークスペースのパッケージをビルドしていない場合は、`yarn run build:deps` もしくは `yarn run build` でビルドします。

環境変数の設定等を行います。

Web サーバーは Next.js を使用しているため、Next.js の機能を使うことができます。開発サーバーを起動する場合は `yarn run dev`を実行します。本番サーバーを動かすには、`yarn run build` でビルドしてから `yarn run start` を実行する方法と、`yarn run export` で生成される静的ファイルを用いる方法の 2 つがあります。生成された静的ファイルを用いてサーバーを立てる場合、`yarn run serve` を利用することもできます。
