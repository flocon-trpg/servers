# core

主に、api-server と web-server の両方から直接参照されるコードで構成されるパッケージです。

このパッケージには、Flocon の部屋のモデルに関するコードが主に含まれています。これは主に次の 2 つから構成されます。

- 部屋のモデル
- 部屋のモデルを、Operational Transformation(OT)の手法を用いて差分を取ったり変換したりする関数の集合

## Flocon の部屋のモデル

次のコードのように書くことで、部屋のモデルの TypeScript の型を生成できます。

```typescript
import { State, roomTemplate } from '@flocon-trpg/core';

type RoomState = State<typeof roomTemplate>;
/*
type RoomState = {
    $v: 2;
    $r: 1;
} & {
    createdBy: string;
    name: string;
    participants: {
        [x: string]: ({
            $v: 2;
            $r: 1;
        } & {
            name: Branded<string, MaxLengthStringBrand<100>> | undefined;
            role: "Player" | ... 2 more ... | undefined;
        }) | undefined;
    } | undefined;
    ... 27 more ...;
    strParamNames: {
        ...;
    } | undefined;
}
*/
```

API サーバーでは、この State のオブジェクトが JSON としてデータベースに保存され、必要に応じて各ブラウザに送信されます。この際、送信される State オブジェクトに非公開のキャラクターやパラメーターなどが含まれる場合は、事前に取り除いてから各ユーザーごとに送信されます。ブラウザ側では、受け取った State オブジェクトを解釈して画面上に現在の部屋の状態を表示します。

2 つの State オブジェクト間の差分を Operation と呼びます。Operation には、UpOperation、DownOperation、TwoWayOperation の 3 種類があります。TwoWayOperation には差分の全ての情報が含まれていますが、UpOperation は時系列が前の State から後の State に変換する情報のみを、DownOperation は時系列が後の State から前の State に変換する情報のみを保持します。例えば、a と b という 2 つの State があるとして、時系列順で古いほうを a、新しいほうを b とします。これらの差分を、UpOperation、DownOperation、TwoWayOperation の 3 種類で生成する場合を考えます。UpOperation は、a を b に変換することはできますが b を a に変換することはできません。DownOperation ではその逆で、b を a に変換することはできますが a を b に変換することはできません。TwoWayOperation は、a←→b の両方向の変換が可能です。

Room モデルに対応する UpOperation、DownOperation、TwoWayOperation の TypeScript の型は、次のように書くことで生成できます。

```typescript
import { DownOperation, TwoWayOperation, UpOperation, roomTemplate } from '@flocon-trpg/core';

type RoomUpOperation = UpOperation<typeof roomTemplate>;
type RoomDownOperation = DownOperation<typeof roomTemplate>;
type RoomTwoWayOperation = TwoWayOperation<typeof roomTemplate>;
```

State オブジェクトの更新内容を ブラウザ ←→ API サーバー 間で伝える際、送受信量を削減するため、新しい State オブジェクトを丸ごと渡すのではなく、差分のみを表す UpOperation オブジェクトが用いられます。

State や Operation に関する関数は次の 10 個があります。

- toUpOperation
- toDownOperation
- apply
- applyBack
- composeDownOperation
- restore
- diff
- clientTransform
- serverTransform
- toClientState

serverTransform と toClientState は、import したものを直接使うことができます。これら以外の関数は、次のコードのように roomTemplate というテンプレートから自動生成できます。これら 10 個の関数の解説は、該当する JSDoc/TSDoc をお読みください。

```typescript
import { roomTemplate } from '@flocon-trpg/core';
import * as Core from '@flocon-trpg/core';

const toUpOperation = Core.toUpOperation(roomTemplate);
const toDownOperation = Core.toDownOperation(roomTemplate);
const apply = Core.apply(roomTemplate);
const applyBack = Core.applyBack(roomTemplate);
const composeDownOperation = Core.composeDownOperation(roomTemplate);
const restore = Core.restore(roomTemplate);
const diff = Core.diff(roomTemplate);
const clientTransform = Core.clientTransform(roomTemplate);

// serverTransform は roomTemplate を使用せずに Core.serverTransform を直接使う。toClientState も同様。
// これらの書き方は実際は冗長であり、わざわざこのように変数を定義する意味はあまりない。
const serverTransform = Core.serverTransform;
const toClientState = Core.toClientState;
```

## テストの実行

`yarn run test`

[^1]: 理論上は composeUpOperation と composeTwoWayOperation も実装できますが、現時点では使う場面がないため実装していません。

## Q&A

### なぜ CRDT でなく OT を採用したのか

※ あくまで私の理解の範囲内での話であり、誤りが含まれるかもしれません。

CRDT は中央集権的なサーバーが存在しないため、サーバーなしで共同編集ができるという特徴があります。それに対して OT ではサーバーが必要です。

ただし、TRPG のセッションにおいては、「ダイスを振る」「非公開のダイスの目を変更した際に、変更したことを全員に通知する」などといった、中央集権的なサーバーなしではクライアントが不正し放題になってしまう処理があるため、CRDT のメリットは活かしにくいと考えられます。また、「秘話を送る」「アップローダーにファイルをアップロードして保存する」「明示的に削除しない限り部屋を残す」「部屋ごとにパスワードをかける」「参加者と観戦者を区別し、観戦者は観戦のみを可能にする」などといった様々な機能も、サーバーなしでは実装は難しくなると推察されます。

以上の理由より、Flocon では OT を選択しています。
