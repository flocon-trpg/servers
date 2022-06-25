# core

主に、api-server と web-server の両方から直接参照されるコードで構成されるパッケージです。

## Flocon の部屋のモデルの使い方

この core パッケージには、Flocon の部屋のモデルに関するコードが含まれています。これは主に次の 2 つから構成されます。

-   部屋のモデル
-   部屋のモデルを、Operational Transformation(OT)の手法を用いて差分を取ったり変換したりする関数の集合

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

API サーバーでは、この State のオブジェクトが JSON としてデータベースに保存され、必要に応じて各ブラウザに送信されます。ブラウザ側は、受け取った State オブジェクトを解釈して画面上に現在の部屋の状態を表示します。

2 つの State オブジェクト間の差分を Operation と呼びます。Operation には、UpOperation、DownOperation、TwoWayOperation の 3 種類があります。TwoWayOperation には差分の全ての情報が含まれていますが、UpOperation は時系列が前の State から後の State に変換する情報のみを、DownOperation は時系列が後の State から前の State に変換する情報のみを保持します。

例えば、a と b という 2 つの State があるとします。これらは何らかの方法でどちらが時系列順で新しい State かを決定することができるとして、古いほうを a、新しいほうを b とします。これらの差分を、UpOperation、DownOperation、TwoWayOperation の 3 種類で生成する場合を考えます。UpOperation は、a を b に変換することはできますが b を a に変換することはできません。DownOperation ではその逆で、b を a に変換することはできますが a を b に変換することはできません。TwoWayOperation は、a←→b の両方向の変換が可能です。

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

ブラウザで State オブジェクトを変更した場合、通信量を削減するため、API サーバーには State オブジェクトではなく UpOperation オブジェクトが送信されます。その変更を適用した後に、他のクライアントに UpOperation オブジェクトを送信することで State に変更があったことを伝えます。

State や Operation に関する関数は次の 9 つがあります。

-   toUpOperation
-   toDownOperation
-   apply
-   applyBack
-   composeDownOperation
-   diff
-   clientTransform
-   serverTransform
-   toClientState

serverTransform と toClientState は、import したものを直接使うことができます。これら以外の関数は、次のコードのように書くことで生成できます。

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
```

## テストの実行

`yarn run test`

[^1]: 理論上は composeUpOperation と composeTwoWayOperation も実装できますが、現時点では使う場面がないため実装していません。
