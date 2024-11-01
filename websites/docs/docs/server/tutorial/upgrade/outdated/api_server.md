---
title: "APIサーバー (Heroku)"
sidebar_position: 1
---

# API サーバーをアップデートする方法

設置済みの API サーバーのアップデートは手動で行う必要があります。ここでは git を用いたアップデート方法を説明します。

:::tip
Heroku における API サーバーのアップデートは git などを使用するため、`Deploy to Heroku` ボタンによる新規作成と比べて少し手間がかかります。ですので git に馴染みがないなどの場合は、アップデートするのではなく新規作成してしまうほうが簡単かもしれません。新規作成の場合は、旧 API サーバーのデータはそのまま残りますので、Heroku Postgres のバックアップも必要なくなるといったメリットがあります。Firebase プロジェクトは API サーバー新規作成の場合でも既に使っているものを流用できますし、複数の API サーバーで並行して利用することもできます。ただし旧 API サーバーを Heroku から削除せずに残す場合は、Heroku の dyno の消費量などに気を付けてください。
:::

:::caution
もし削除されてほしくない部屋データなどがある場合は、念のためアップデート前に Heroku Postgres のバックアップ機能を用いて、データベースのバックアップを取っておくことを推奨します。
:::

まず [Heroku CLI と git をインストール](https://devcenter.heroku.com/ja/articles/heroku-cli)します。

次のコマンドを実行して、`Deploy to Heroku`ボタンのソースコードを入手します。

```
$ git clone https://github.com/flocon-trpg/heroku-api-getting-started.git
```

:::note
コマンドを実行する際は、$の文字は入力しないでください。
:::

ダウンロードされた `heroku-api-getting-started` フォルダはリネームしたり別の場所に移動しても構いません。

`heroku-api-getting-started` フォルダ内にある `api-server.Dockerfile` をテキストエディタで開き、`ARG branch=` で始まる行を探して、アップデートさせたいバージョンに置き換えます。

`heroku-api-getting-started` フォルダで、次のコマンドを実行して変更をコミットします。`update api-server.Dockerfile` の部分は他の文章に置き換えても構いません。

```bash
$ git commit -am "update api-server.Dockerfile"
```

次のコマンドを実行して、Heroku にコードを push する準備を整えます。`<APIサーバーのアプリケーション名>`の部分は、Heroku の `App name` の値と同じになります。

```bash
$ heroku git:remote -a <APIサーバーのアプリケーション名>
```

次のコマンドを実行して、Heroku にデータを送信します。アップデートが完了するまで数分程度かかります。この間にログが表示されますが、これは Heroku から出力されているログを自動的に読み取っているだけであるため、通常は問題ありません。

```bash
$ git push heroku main
```

これでアップデートは完了です。