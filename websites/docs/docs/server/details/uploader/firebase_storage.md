---
title: 'Firebase Storage版アップローダー'
sidebar_position: 2
---

## 設定方法

Firebase の管理ページを開き、`Storage`から`始める`ボタンをクリックします。

![1.png](/img/docs/firebase-storage/1.png)

表示されるメッセージを読み、`次へ`や`完了`ボタンを押して作成します。`Cloud Storageのロケーション`ですが、この Firebase プロジェクトを Flocon のみで利用してなおかつ日本からのアクセスが多いと予想される場合は`asia-northeast1`（東京）もしくは`asia-northeast2`（大阪）でいいと思われます。ただし、他の地域を選んでもそこまで大きくユーザー体験が損なわれることはないと考えられます。

`Storage`から`Rules`を選択して、セキュリティルールの編集を行います。

![4.png](/img/docs/firebase-storage/4.png)

:::caution
セキュリティルールの編集を行わない場合、事実上すべてのユーザーが自由にファイルを取得、アップロード、編集、削除できてしまいます。そのため最低限のセキュリティルールの設定を行うことを推奨します。
:::

## セキュリティルール設定例 1

次のセキュリティルールを適用することで、「ファイル名がわからない限りファイルをダウンロードできない」という制限をかけることができます。

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /version/1/uploader/unlisted/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid==userId;
    }
    match /version/1/uploader/unlisted/{allPaths=**} {
      allow get: if request.auth!=null;
    }
  }
}
```

このセキュリティルールは次のようなルールで動きます。

- ログインしていないユーザーは、ファイルのダウンロード、アップロード、編集、削除は一切できない
- ログインしている全てのユーザーはファイルのアップロードが可能
- ファイルの名前とアップロードしたユーザーの UID がわかっている場合、ログインしている全てのユーザーがそのファイルをダウンロード可能
- ファイル名一覧は、自分がアップロードしたものしか取得できない

なお、この文章における"ログインしている全てのユーザー"は、エントリーしていないユーザーも含みます。アップロードを一部のユーザーだけに制限したい場合は、例えば次のように許可リスト方式で設定できます。

## セキュリティルール設定例 2

このルールでは、特定のユーザーのみにファイルのアップロードを許可しています。この例では`qweRTYuioP123`と`asdFGHjkl456`と`zxcVBNnm7890`の 3 ユーザーのみに許可されています。

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
  	function isPermittedUser(requestAuthUid) {
    	// アップロードを許可するユーザーUIDを入力します。この例ではユーザーUIDが qweRTYuioP123, asdFGHjkl456, zxcVBNnm7890 のいずれかのユーザーのみにアップロードを許可します。
        let permittedUsers = [
      	"qweRTYuioP123",
        "asdFGHjkl456",
        "zxcVBNnm7890"
      ];

    	return requestAuthUid in permittedUsers;
    }
    match /version/1/uploader/unlisted/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid==userId && isPermittedUser(request.auth.uid);
    }
    match /version/1/uploader/unlisted/{allPaths=**} {
      allow get: if request.auth!=null;
    }
  }
}
```

このセキュリティルールは次のようなルールで動きます。

- ログインしていないユーザーは、ファイルのダウンロード、アップロード、編集、削除は一切できない
- 指定したユーザー以外がファイルをアップロードすることを禁止する
- ファイルの名前とアップロードしたユーザーの UID がわかっている場合、ログインしている全てのユーザーがそのファイルをダウンロード可能
- ファイル名一覧は、自分がアップロードしたものしか取得できない

これらの他にも、[Firebase の解説サイト](https://firebase.google.com/docs/rules?hl=ja)などを参考にして、独自にカスタマイズしたセキュリティルールを用いても構いません。

## 管理者によるファイルの追加、変更、削除

Firebase の管理ページから`Storage`をクリックして`Files`を選択することでファイル一覧を表示できますが、ここから直接ファイルを追加、変更、削除してもアップローダーの動作に支障はありません。なお、当然ですが削除されたファイルはアップローダーから利用できなくなりますので注意してください。

## サーバー設置のチュートリアルからこのページに移動してきた方へ

サーバー設置のチュートリアルの [Web サーバーを設置する](/docs/server/tutorial/web_server#prepare-out) のページからこのページに移動してきた方へ:

これでアップローダーの設定は完了です。[元のページ](/docs/server/tutorial/web_server#prepare-out)に移動して、Web サーバーの設置作業を再開できます。
