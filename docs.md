# docs

## caveats

### this は使用不可

原則として、どの状況であっても this を使うことはできない。グローバルオブジェクトを参照したい場合は代わりに globalThis を使わなければならない。

this が使えない理由は、実装コストの問題。通常の Javascript では、例えば下のコードで x.b()とすると undefined ではなく 1 を返す。

```typescript
let x = {
    a: 1,
    b() {
        return this.a;
    },
};
```

また、下のコードでは通常の Javascript では a に 1 が push されそうだが、実際は push のときに`can't convert undefined to object`といったエラーを返す。理由は、`a.push(1)`とすると、配列クラス（？）のメソッド内における this は a になり正常に処理されるが、`f(1)`とすると this は a ではなく undefined になり正常に処理できないため。

```typescript
let a = [];
let f = a.push;
f(1);
```

これらの場合分けの処理が面倒なうえ、Flocon のスクリプトという小規模なコードでは実装に見合う対価が少ないと判断し、this を一切使えないようにすることで対処している。

なお、2 つ目コードはこのライブラリでは正常に処理され、a に 1 が push される（function が実行されたとき、.の左側が this になるという場合分けも省略しているため）。

### globalThis の参照について

globalThis に渡すオブジェクトは、子孫も含め全て別のオブジェクトに変換されてから処理される。例えば文字列は`FString`に、配列は`FArray`に変換され、どれにも変換できなかったものは`FObject`に変換される、といった具合である。また、`FValue`という型が下のように定義されている。

```typescript
type FValue = FString | FArray | FObject | …
```

ここで、`FObject`はセキュリティを強固にするため、内部で Map にしてからコードが実行されるようになっている。getGlobalThis で値を返す際に`Object`に戻る。`FArray`も同様に、内部で`unknown[]`が`FValue[]`に変換され、getGlobalThis で`unknown[]`に戻る。つまり、オブジェクトを JSON に変換するのと似たような現象が起こる。例えば下のようになる。

```javascript
// 例1

const globalThis = { obj: { x: 1 } };
const execResult = exec('globalThis.obj.x = 2', globalThis);
const globalThisAfterExec = execResult.getGlobalThis();

console.log(globalThis.obj.x); // 一見2が出力されそうだが、実際は1
console.log(globalThisAfterExec.obj.x); // 2
```

```javascript
// 例2

const obj = { x: 1 };
const globalThis = { obj1: obj, obj2: obj };
const execResult = exec('globalThis.obj1.x = 2; globalThis.obj2.x;', globalThis);
const globalThisAfterExec = execResult.getGlobalThis();

console.log(execResult.result); // 一見2が出力されそうだが、実際は1
console.log(globalThisAfterExec.obj1.x); // 2
console.log(globalThisAfterExec.obj2.x); // 一見2が出力されそうだが、実際は1
```

例 2 で`obj1`と`obj2`の参照を一致させたい場合は、`createFValue`を使って下のようにすればよい。これは、globalThis に`FValue`のインスタンスが含まれている場合は、それは変換されずにそのまま渡されるという性質を利用している。

```javascript
// 例3

const obj = createFValue({ x: 1 });
const globalThis = { obj1: obj, obj2: obj };
const execResult = exec('globalThis.obj1.x = 2; globalThis.obj2.x', globalThis);
const globalThisAfterExec = execResult.getGlobalThis();

console.log(execResult.result); // 2
console.log(globalThisAfterExec.obj1.x); // 2
console.log(globalThisAfterExec.obj2.x); // 2
```
