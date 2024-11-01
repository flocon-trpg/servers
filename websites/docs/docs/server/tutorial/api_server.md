---
title: "2. APIサーバーを設置する"
sidebar_position: 3
---

このページでは [fly.io](https://fly.io/) に API サーバーを設置する方法を説明します。

:::info
2022年9月ごろまで、この解説ページでは fly.io ではなく Heroku を利用する方法を紹介していましたが、[2022 年に無料枠が廃止されることが決まった](https://blog.heroku.com/next-chapter) ため、現在は代わりに fly.io を利用する方法を解説しています。

Heroku もしくは他の方法で設置する場合は、[こちら](/docs/server/details/api-server) をご覧ください。
:::

## fly.io とは

fly.io は、クラウド上にサーバーを設置できるサービスです。fly.io には永続的に使える無料枠があり、これを利用することで無料で API サーバーを設置できます。

## シェルについて

API サーバーの設置は、CLI から操作する必要があります。macOS ではターミナルなどを用います。Windows にはコマンドプロンプトや PowerShell などがありますが、API サーバーの設置に用いる際は PowerShell のほうを推奨します[^1]。Linux ユーザーの場合はおそらく説明は不要でしょう。

## flyctl のインストール

まず、flyctl という fly.io が提供するツールをインストールする必要があります。

### macOS

Homebrew がインストールされている場合は、次のコマンドを実行することでインストールできます。

```console
brew install flyctl
```

インストールされていない場合は、次のコマンドでもインストールできます。

```console
curl -L https://fly.io/install.sh | sh
```

### Linux

次のコマンドを実行することでインストールできます。

```console
curl -L https://fly.io/install.sh | sh
```

### Windows

次のコマンドを**PowerShell で**実行することでインストールできます。

```console
iwr https://fly.io/install.ps1 -useb | iex
```

## アカウントの作成

fly.io のアカウントを作成していない場合は、次のコマンドを実行してアカウントの作成を行います。

```console
flyctl auth signup
```

もしすでにアカウントが作成済みの場合は、代わりに次のコマンドを実行することでログインできます。

```console
flyctl auth login
```

アカウント作成後に下の画像のようにクレジットカードの入力が求められます。クレジットカードを登録することで無料枠が拡張されますが、未登録でも API サーバーを動かすことは可能です。

![add_credit_card.png](/img/docs/flyio/add_credit_card.png)

:::note
クレジットカード未登録の場合、再デプロイなどをする際に `We need your payment information to continue! …` というメッセージが出ることがあります。これは試用期間が終了したことを意味しており、再デプロイする際はクレジットカードの登録か credit の追加が必要になります。これらが必要な理由は課金の要求ではなく [悪用されるのを](https://fly.io/blog/free-postgres/#a-note-about-credit-cards) [防ぐため](https://news.ycombinator.com/item?id=32596697) (Amazon Web Service など、同様の対策をとっているサービスも数多く存在します)であり、無料枠の範囲内であれば課金されることはありません。
:::

:::danger
クレジットカードを登録した場合、念のため、多額の費用がかかっていないか定期的に確認してください。Flocon の作者は、Flocon およびこのサイトの利用により生じた損害等について一切の責任を負いません。
:::

## API サーバーのデプロイ

### Dockerfile の入手

[リリース一覧](https://github.com/flocon-trpg/servers/releases)からダウンロードしたいバージョンを探します。どのバージョンを選ぶべきかよくわからない場合は、基本的には Pre-release が付いてないものの中から最新のバージョンを選べば大丈夫です。

選んだバージョンの下の方に`flocon_api_server_flyio.zip`のリンクがあるので、それをダウンロードします。

![github.png](/img/docs/flyio/github.png)

ダウンロードした zip ファイルを展開します。`Dockerfile` というただ 1 つのファイルが展開されたかと思います。管理しやすい場所に空のフォルダを作成し、そのフォルダ内に `Dockerfile` ファイルを移動します[^2]。

:::tip
`Dockerfile`の中身は、`FROM kizahasi/flocon-api-swap256mb:v*.*.*`(`v*.*.*` の部分には API サーバーのバージョンが入ります)の 1 行だけです。ダウンロードせずに自分で作成しても構いません。

`kizahasi/flocon-api-swap256mb` イメージの Dockerfile は [https://github.com/flocon-trpg/servers/blob/main/docker/api-server-swap256mb/Dockerfile](https://github.com/flocon-trpg/servers/blob/main/docker/api-server-swap256mb/Dockerfile) にあります。このリンク先にある Dockerfile を代わりに使用しても問題ありませんが、デプロイする際にビルドなどに少し時間がかかります。
:::

### flyctl launch

`Dockerfile` のあるフォルダに移動します。フォルダの移動は cd コマンドなどを用います。例えば `Dockerfile` が `C:/aaa/bbb` にある場合は、`cd C:/aaa/bbb` と入力して Enter キーを押すことで移動できます。

移動したら、次のコマンドを実行して、デプロイの下準備を行います。

```shell
flyctl launch
```

:::info
Windows で `Error name argument or flag must be specified when not running interactively` というメッセージが出る場合は、次のいずれかの方法で回避できます。

- [Windows ターミナル](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701) をインストールして、Windows ターミナルから PowerShell を起動して実行する。
- WSL を利用する。
:::

`App Name (leave blank to use an auto-generated name)`というメッセージが表示されるので好きな App Name を入力します。自動生成でよければ空白でも構いません。

`Select region`というメッセージが表示されます。API サーバーをデプロイする地域を設定します。よくわからない場合は、`nrt (Tokyo, Japan)`で構いません[^3]。

`Would you like to set up a Postgresql database now?`というメッセージが表示されます。データベースとして SQLite を使用する場合は`N`を、fly.io の PostgreSQL サービスを使用する場合は`y`を入力します。よくわからなければ`N`を入力してください。

`Would you like to deploy now?`というメッセージが表示されます。デプロイの前に行う必要のある設定があるため、ここでは`N`を入力します。もし`y`を選んでデプロイしてしまった場合でも、後から再デプロイできるので問題ありません。

これで`flyctl launch`の作業は完了です。`Dockerfile`ファイルのある場所に、`fly.toml`という fly.io の設定ファイルが作成されていることが確認できます。

### 永続ストレージの作成

`Dockerfile` のあるフォルダで、次のコマンドを実行して永続ストレージを作成します。

```console
flyctl volumes create my_storage --size 1
```

コマンドの`my_storage`の部分は好きな名前に置き換えても構いません。`--size`は1より大きい値にしても構いませんが、よくわからない場合は1を推奨します。

:::tip
Heroku と異なり、fly.io の永続ストレージにあるファイルは自動的に消去されることはありません。
:::

次に、永続ストレージのマウントに関する設定を行います。`fly.toml`ファイルをメモ帳などのテキストエディタで開きます。例えば次のようになっているかと思います。

```toml
# fly.toml file generated for flocon-api-tutorial-app on 2022-08-30T00:00:00+09:00

app = "flocon-api-tutorial-app"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]

[experimental]
  allowed_public_ports = []
  auto_rollback = true

(以下略)
```

次の文字列を入力します。`my_storage`以外の名前にしている場合は、適宜置き換えてください。入力する場所がわからない場合は、`[env]`と`[experimental]`の間に入力すれば大丈夫です。

```toml
[[mounts]]
  source = "my_storage"
  destination = "/data"
```

:::caution
`destination` で指定したパス(上の例では`/data`)以外にあるファイルは、再デプロイ時などに自動的に削除されます。このチュートリアルにしたがった設定を行う場合は問題ありませんが、チュートリアルにない設定を行う際はご注意ください。
:::

入力後は下のような感じになっていると思います。

```toml
# fly.toml file generated for flocon-api-tutorial-app on 2022-08-30T00:00:00+09:00

app = "flocon-api-tutorial-app"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]

[[mounts]]
  source = "my_storage"
  destination = "/data"

[experimental]
  allowed_public_ports = []
  auto_rollback = true

(以下略)
```

### 環境変数の設定

API サーバーの設定をします。設定には環境変数を用います。fly.io では、環境変数のセットは次の 2 つのいずれかの方法で行うことができます。併用することもできます。

- `fly.toml`に記述する
- `flyctl secrets set`コマンドを利用する

どちらを使っても動作自体に支障はありませんが、fly.io では [慎重に扱うべき値は`flyctl secrets set`を使うことを推奨しています](https://fly.io/docs/reference/secrets/)。ただし、このチュートリアルで扱う値は、すべて`fly.toml`で設定して構いません[^4]。

#### fly.toml ファイルを用いた設定方法

`fly.toml` ファイルを開きます。例えば次のようになっているかと思います。`[env]`と`[[mounts]]`の間に設定を記述していきます。

最終的な入力例は次のようになります。`[env]`と`[experimental]`の間の部分以外は編集前と変わっていません。なお、この入力例をそのまま用いるとエラーになりますのでご注意ください(`FIREBASE_PROJECT_ID` の部分を変える必要があります)。

```txt
# fly.toml file generated for flocon-api-tutorial-app on 2022-08-30T00:00:00+09:00

app = "flocon-api-tutorial-app"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]
PORT="8080"
AUTO_MIGRATION="true"
FIREBASE_PROJECT_ID="my-firebase-project-id"
DATABASE_URL="file:///data/main.sqlite3"
ENTRY_PASSWORD='{"type":"none"}'
NODE_ENV="production"

[[mounts]]
  source = "my_storage"
  destination = "/data"

[experimental]
  allowed_public_ports = []
  auto_rollback = true

(以下略)
```

:::note
`fly.toml` ファイルは、TOML という言語で記述します。そのため、.env ファイル(.env.local もこれに含まれます)とは文法が異なりますのでご注意ください。一例として、TOML の場合は`=`の右辺が文字列の場合は必ず`"`か`'`などで囲む必要があります。
:::

#### PORT, AUTO_MIGRATION

`PORT`は`"8080"`に、`AUTO_MIGRATION`は`"true"`に設定します。これらは fly.io にデプロイする全ての API サーバーにおいて共通の設定です。

```toml
PORT="8080"
AUTO_MIGRATION="true"
```

#### FIREBASE_PROJECT_ID

`FIREBASE_PROJECT_ID`は、Firebase の設定情報に書かれています。まずは Firebase の設定情報にアクセスします。

![1.png](/img/docs/firebase-config/1.png)

このページの下部に、下のように`const firebaseConfig = {`で始まるコードがあります。この中から`projectId:`で始まる行を探し、その右の文字列を確認します。下の例ですと`"my-firebase-project-id"`が該当します。

```javascript
const firebaseConfig = {
  apiKey: "*************",
  authDomain: "*****.firebaseapp.com",
  databaseURL: "https://*****.firebaseio.com",
  projectId: "my-firebase-project-id",
  storageBucket: "*****",
  messagingSenderId: "*****",
  appId: "************",
  measurementId: "*****",
};
```

この文字列を`"`の部分を含めてコピーし、左に`FIREBASE_PROJECT_ID=`を付けます。例えば下のようになります。

```toml
FIREBASE_PROJECT_ID="my-firebase-project-id"
```

:::note
API サーバー v0.7.10 では `FIREBASE_PROJECTID` のみが使用可能でしたが、v0.7.11 以降では代わりに `FIREBASE_PROJECT_ID` も使用できます。どちらを用いても同じ挙動となります。
:::

#### データベース

データベースは下のようにします[^5]。

```toml
DATABASE_URL="file:///data/main.sqlite3"
```

:::note
API サーバー v0.7.7 以下では、fly.io などで `DATABASE_URL` を使用できません。v0.7.8 以上を使う必要があります。 
:::

:::tip
SQLite の代わりに PostgreSQL もしくは MySQL を使うこともできます。その場合は[こちら](../details/api-server/vars#DATABASE_URL) を参照して設定してください。
:::

#### ENTRY_PASSWORD

サイトにアクセスする際にパスワードをかけることができます。パスワードは全員に共通ですので、パスワードを設定した場合は何らかの方法で利用者にパスワードをお伝えください。

共通パスワードを設定しない場合は、次のようにします。

```toml
ENTRY_PASSWORD='{"type":"none"}'
```

共通パスワードを設定する場合は、[こちら](../details/api-server/vars#ENTRY_PASSWORD) を参照のうえ設定してください。

:::tip
共通パスワードとは別に、部屋ごとにパスワードをかけることもできます。そのため、共通パスワードを設定しなくても部屋への入室を制限することは可能です。
:::

#### NODE_ENV

下のようにすることで、API サーバーが本番環境のモードで実行されるようになります。この設定をしなくても動きますが、デバッグ目的などでない限りは`production`をセットするほうが望ましいです。

```toml
NODE_ENV="production"
```


## API サーバーをデプロイする

`flyctl deploy`コマンドを実行することでデプロイされます。`flyctl launch`コマンドを実行したフォルダと同じフォルダで実行する必要があります。

## API サーバーの動作確認

[fly.io](https://fly.io/) にアクセスして、右上の「Dashboard」ボタンをクリックします。「Dashboard」ボタンがない場合は、「Sign In」ボタンからログインすると表示されます。

![top_page_signed_in.png](/img/docs/flyio/top_page_signed_in.png)

Apps 一覧が表示されるので、デプロイした app を選択します。

![apps.png](/img/docs/flyio/apps.png)

:::note
`Free builder`は自動的に作られるビルド用の app です。そのまま残しておいて構いません。
:::

ページ中央あたりに`******.fly.dev`のリンクがあるのでそれをクリックします。

![hostname.png](/img/docs/flyio/hostname.png)

「API サーバーは稼働しています 😊 」のメッセージが表示されればおそらく成功です。エラーメッセージが表示される、もしくは応答がない場合は、デプロイに失敗しています。その場合は`******.fly.dev`のリンクがあるページの左上あたりにある「Monitoring」のログを参考にしつつ、設定に誤りがないかどうか確認してください。

## API サーバーを再デプロイする方法

`fly.toml`や`Dockerfile`を変更した後、再度`flyctl deploy`コマンドを実行することで再デプロイできます。この方法で API サーバーのアップデートもできます。

## 次のステップに進む

これで API サーバーのセットアップは完了です。次は[Web サーバーを設置する](./web_server)のページをご覧ください。

## 備考

- [Heroku から fly.io への Migration 機能](https://fly.io/docs/rails/getting-started/migrate-from-heroku/) は Flocon では使えないようです。

[^1]: PowerShell を推奨している理由は、flyctl のインストールには PowerShell が必要なのと、コマンドプロンプトでは cd コマンドでドライブをまたぐ場合は`/d`スイッチが必要であり説明が少し複雑になってしまうのを避けるためです。
[^2]: 空でないフォルダに Dockerfile を置いても構いませんが、Dockerfile のある場所に他のファイルが自動的に作成されるので、Dockerfile 以外にファイルのないフォルダが管理しやすくなります。
[^3]: 日本からの利用者が多い場合は、物理的な距離が近い`nrt (Tokyo, Japan)`を選ぶことで通信ラグが小さくなるため、わずかですがユーザー体験の向上が期待できます。ただし、[fly.io の料金表によると、アメリカにデプロイすると日本と比べてデータ転送の無料枠が大きく料金も安くなる](https://fly.io/docs/about/pricing/#outbound-data-transfer)といったメリットがあるため、通信量が多くなると予想される場合は`sea (Seattle, Wahington (US))`などといった北米西海岸のリージョンのほうが適しているかもしれません。また、API サーバーは Firebase Authentication によってユーザーの認証を確認するため、Firebase のリージョンも少なからず影響する可能性があります。なお、API サーバーは各ブラウザと通信しますが、Web サーバーとの通信は行いません。そのため、API サーバーは Web サーバーと近い地域にデプロイする必要はありません。
[^4]: `ENTRY_PASSWORD` は、パスワードという点を考えると機密情報ですが、ユーザー全員で共有される文字列であることと、部屋ごとに別途パスワードをかけることもできることから、`fly.toml` で設定しても大きな問題にはなりにくいと考えられます。もし漏洩が大きな問題になりうるケースの場合は、bcrypt を利用したうえで、`flyctl secrets set` コマンドを利用してセットしてください。
[^5]: この例では `/data/main.sqlite3` としていますが、永続ストレージ内にあり、なおかつ他のファイルと重複しない限り、他のパスを指定しても構いません。