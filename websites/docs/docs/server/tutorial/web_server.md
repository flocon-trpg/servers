---
title: "3. Webサーバーを設置する"
sidebar_position: 4
---

このページでは[Netlify](https://www.netlify.com/)にドラッグ＆ドロップで Web サーバーを設置する方法を説明します。

## Netlify について

Netlify は、静的な Web サイトを無料で作成できるサービスです[^1]。Netlify はドラッグ＆ドロップでも設置できるため非常に簡単という大きな長所があります。

## Web サーバーのファイルを準備する {#prepare-out}

[リリース一覧](https://github.com/flocon-trpg/servers/releases)からダウンロードしたいバージョンを探します。どのバージョンを選ぶべきかよくわからない場合は、基本的には Pre-release が付いてないものの中から最新のバージョンを選べば大丈夫です。

選んだバージョンの下の方に`flocon_web_server.zip`のリンクがあるので、それをダウンロードしてファイルを展開します。

展開すると`out`という名前のフォルダが作成されます。その中に`env.txt`というテキストファイルがありますが、このファイルに Web サーバーの設定を記述する必要があります。[Web サーバー公式設定ツール](https://tools.flocon.app/web-server) を利用して、`env.txt`を編集してください。

:::info
Firebase Storage 版アップローダーを有効化する場合は、あわせて[こちらの解説](/docs/server/details/uploader/firebase_storage)から Firebase Storage の設定を行う必要があります。
:::

必要であれば、`tos.md`を編集することで利用規約を、`privacy_policy.md`を編集することでプライバシーポリシーを設定することもできます。これらは Markdown という言語で記述します。編集はメモ帳などのテキストエディタで可能です[^2]。

これで Web サーバーのファイルの準備は完了しました。次に Netlify にこれらのファイルをアップロードして設置します。

## Netlify に設置する

まずは[Netlify のサイト](https://www.netlify.com/)からアカウントを作成します。

アカウントの作成が完了したら、下のような画面になります。「Drag and drop your site output folder here」のところに out フォルダをドラッグ＆ドロップします。

![netlify1.png](/img/docs/netlify/1.png)

:::danger
ドラッグ＆ドロップしたフォルダの中身はほぼ全て[^3]がそのままの形でウェブサイト上に公開されます。そのため、out フォルダ内に機密情報などに関わるデータを含めないように気をつけてください。
:::

:::info
[Web サーバー公式設定ツール](https://tools.flocon.app/web-server) を用いて`env.txt`ファイルに記述した設定は、`env.txt`ファイルの中身を閲覧せずともウェブサイトにアクセスすることで全て取得可能です。ですので、誤って機密情報に関わるデータやコメントを記述したりしていない限り、`env.txt`ファイルをウェブサイト上に公開することに問題はありません。
:::

デプロイが成功したら、下の画面になります。いったんランダムな URL が割り当てられています。この URL にアクセスしてみて、Flocon のトップページが表示されていれば成功です。

![netlify1.png](/img/docs/netlify/2.png)

:::tip
アップロード直後などはサイトが重いことがあります。その場合は時間を空けて再度試してみてください。
:::

URL はこのままでも構いませんが、もし変更したい場合は`Site settings` > `Domain management` の `Custom domains` > `Options` などから変更できます。

これで Web サーバーの設置は完了しました！

## Firebase Authentication の承認済みドメインの設定

<!--「設置後の設定」にも同様の項目があるので、このページを編集したらそちらもあわせて編集する-->

最後に、Firebase Authentication の管理ページを開き、承認済みドメインを追加します。例えば`https://example.netlify.app/`に設置した場合は、`example.netlify.app`をドメインとして追加します。

この作業を行わないとログインやユーザー登録ができないので注意してください。

:::info
API サーバーのドメインを追加する必要はありません。
:::

![domain.png](/img/docs/firebase-auth/domain.png)

## サーバー設置完了 🎉

お疲れさまでした！これで Flocon のサーバー設置は完了です。この Netlify の URL にアクセスすればどなたでも Flocon を利用することができます。

[^1]: 余談ですが、このサイトも Netlify で運用しています。
[^2]: 多機能なエディタを利用したい場合は [Visual Studio Code](https://azure.microsoft.com/ja-jp/products/visual-studio-code/) などがおすすめです。
[^3]: `Thumbs.db`など一部のファイルは自動的に除外されるようです。
