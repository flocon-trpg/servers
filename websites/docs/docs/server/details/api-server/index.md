---
sidebar_position: 1
---

# 設置方法について

APIサーバーの設置方法として、次の方法が提供されています。

- fly.io にデプロイする。無料でなおかつ比較的簡単に設置できる方法です。詳しくは[チュートリアルのページ](/docs/server/tutorial/api_server)をご覧ください。
- Docker Hubにある[Floconの公式イメージ](https://hub.docker.com/repository/docker/kizahasi/flocon-api)もしくは[GitHubリポジトリにあるDockerfile](https://github.com/flocon-trpg/servers/tree/main/docker)を利用する。
- [ソースコード](https://github.com/flocon-trpg/servers)をダウンロードしてビルドする。この方法の解説は[ソースコードからビルドして設置](./deploy/general.md)をご覧ください。

なお、API サーバー v0.7.7 以前では次の方法も提供していましたが、[Heroku の無料枠の廃止](https://blog.heroku.com/next-chapter)に伴い、v0.7.7 より後のバージョンでは提供が停止されます。ただし、Heroku へのデプロイ自体は引き続き可能だと思われます。

- Deploy to Heroku ボタンを利用して Heroku にデプロイする。この方法の解説は[こちら](/docs/server/tutorial/outdated/heroku)をご覧ください。