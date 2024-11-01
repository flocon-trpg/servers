---
title: "環境変数の一覧"
sidebar_position: 4
---

import { WebVarExample as Example } from '../../../../src/components/WebVarExample';

:::note
このページを見ながら設定する代わりに、[Webサーバー公式設定ツール](https://tools.flocon.app/web-server)を用いることもできます。
:::

## NEXT_PUBLIC_API_HTTP (必須){#NEXT_PUBLIC_API_HTTP}

APIサーバーのHTTPのアドレスを入力します。通常は `https://` もしくは `http://` で始まります。

### 入力例

<Example
keyName='NEXT_PUBLIC_API_HTTP'
value='https://example.com' />

## NEXT_PUBLIC_API_WS (必須)

APIサーバーのWebSocketのアドレスを入力します。通常は、(NEXT_PUBLIC_API_HTTP)[#NEXT_PUBLIC_API_HTTP] の `https://` もしくは `http://` の部分をそれぞれ `wss://` と `ws://` に置き換えたものになります。

### 入力例

<Example
keyName='NEXT_PUBLIC_API_WS'
value='wss://example.com' />

## NEXT_PUBLIC_AUTH_PROVIDERS (省略可)

Firebase Authenticationで有効化したログイン方法を入力することで、入力しなかったログイン方法をウェブページで隠すことができます。複数ある場合は`,`で区切ります。空の場合は、全てのログイン方法が表示されます。

現時点で利用可能な値は、`anonymous`、`email`、`google`、`facebook`、`github`、`twitter`、`phone` です。

### 入力例

<Example
keyName='NEXT_PUBLIC_AUTH_PROVIDERS'
value='email,google' />

この例ではメールパスワードとGoogleの2つのログイン方法を入力しています。

## NEXT_PUBLIC_FIREBASE_CONFIG (必須)

[APIサーバーのNEXT_PUBLIC_FIREBASE_CONFIG](/docs/server/details/api-server/vars#NEXT_PUBLIC_FIREBASE_CONFIG)と同じ値を入力します。

### 入力例

<Example
keyName='NEXT_PUBLIC_FIREBASE_CONFIG'
value='{"apiKey":"***","authDomain":"***.firebaseapp.com","databaseURL":"https://***.firebaseio.com","projectId":"***","storageBucket":"***.appspot.com","messagingSenderId":"***","appId":"***"}' />

## NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED (省略可)

Firebase Storage 版アップローダーを有効化する場合は `true` を入力します。

:::info
有効化する場合は、あわせて Firebase 管理ページから Firebase Storage サービスを有効化する必要があります。
:::

### 入力例

<Example
keyName='NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED'
value='true' />

## NEXT_PUBLIC_LOG_LEVEL (省略可) (v0.8.4 で追加)

出力するログのレベルを設定できます。`fatal`、`error`、`warn`、`info`、`debug`、`trace`、`silent` のいずれかの値をセットできます。値がセットされていない場合は `info` がセットされたときと同じ動作をします。

`silent` の場合、一切のログ出力を行いません。`silent` 以外の場合は、セットされたレベル以上のログのみを出力します。例えば `warn` をセットした場合、`fatal`、`error`、`warn` のレベルのログのみが出力されます。

ログはブラウザに出力されます。

:::tip
`debug` や `trace` は [console.debug](https://developer.mozilla.org/ja/docs/Web/API/console/debug) メソッドで出力されますが、Chrome などでは初期状態では表示されません。表示されない場合はブラウザの設定等を確認してください。
:::

### 入力例

<Example
keyName='NEXT_PUBLIC_LOG_LEVEL'
value='debug' />