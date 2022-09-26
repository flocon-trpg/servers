# core

主に、api-server と web-server の両方から直接参照されるコードで構成されるパッケージです。

このパッケージには、Flocon の部屋のモデルに関するコードが主に含まれています。これは主に次の 2 つから構成されます。

-   部屋のモデル
-   部屋のモデルを、Operational Transformation(OT)の手法を用いて差分を取ったり変換したりする関数の集合

## Flocon の部屋のモデル

部屋のモデルは TypeScript の型で表現されます。次のコードのように書くことで生成できます。

```typescript
import { State as S, roomTemplate } from '@flocon-trpg/core';

type State = S<typeof roomTemplate>;
/*
type State = {
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

API サーバーでは、この State のオブジェクトが JSON としてデータベースに保存され、必要に応じて各ブラウザに送信されます。この際、送信される State オブジェクトに非公開のキャラクターやパラメーターなどが含まれる場合は、ユーザーごとにそれぞれ判定して事前に取り除かれてから送信されます。ブラウザ側は、受け取った State オブジェクトを解釈して画面上に現在の部屋の状態を表示します。

2 つの State オブジェクト間の差分を Operation と呼びます。Operation には、UpOperation、DownOperation、TwoWayOperation の 3 種類があります。TwoWayOperation には差分の全ての情報が含まれていますが、UpOperation は時系列が前の State から後の State に変換する情報のみを、DownOperation は時系列が後の State から前の State に変換する情報のみを保持します。

例えば、a と b という 2 つの State があるとして、時系列順で古いほうを a、新しいほうを b とします。これらの差分を、UpOperation、DownOperation、TwoWayOperation の 3 種類で生成する場合を考えます。UpOperation は、a を b に変換することはできますが b を a に変換することはできません。DownOperation ではその逆で、b を a に変換することはできますが a を b に変換することはできません。TwoWayOperation は、a←→b の両方向の変換が可能です。

UpOperation、DownOperation、TwoWayOperation も、TypeScript の型で表現されます。先ほどの Room モデルを表す State オブジェクトに対応する Operation の型は、次のように書くことで生成できます。

```typescript
import {
    DownOperation as D,
    TwoWayOperation as T,
    UpOperation as U,
    roomTemplate,
} from '@flocon-trpg/core';

type UpOperation = U<typeof roomTemplate>;
type DownOperation = D<typeof roomTemplate>;
type TwoWayOperation = T<typeof roomTemplate>;
```

State オブジェクトの更新に関するブラウザ ←→ API サーバー 間の通信には、送受信量を削減するため、State オブジェクトではなく UpOperation オブジェクトが用いられます。

State や Operation に関する関数は次の 10 個があります。

-   toUpOperation
-   toDownOperation
-   apply
-   applyBack
-   composeDownOperation
-   restore
-   diff
-   clientTransform
-   serverTransform
-   toClientState

serverTransform と toClientState は、import したものを直接使うことができます。これら以外の関数は、次のコードのように書くことで生成できます。これら 10 個の関数の解説は、該当する TSDoc をお読みください。

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
