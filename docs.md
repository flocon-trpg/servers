# docs

## caveats

### var は使用不可

var 独自の仕様に対応させるのが面倒なため、var は実装していない。代わりに let や const を使う。

### this は常に globalThis と等しい

原則として、どの状況であっても this は globalThis と等しくなる。this は一般的な言語と比べて複雑な挙動となるため、それを正確に再現するのは時間がかかると判断した。ただし、function や class などが使用不可であるため、この仕様は実際に触る上ではほぼ顕在化しない。

ただ、この仕様による挙動の違いも一部存在する。例えば下のコードでは通常の Javascript では a に 1 が push されそうだが、実際は push のときに`can't convert undefined to object`といったエラーを返す。だが、このライブラリでは正常に処理され、a は`[1]`となる。

```typescript
let a = [];
let f = a.push;
f(1);
```

この理由は、配列の実装の違いによるもの。通常の Javascript における this は関数呼び出しのベースオブジェクトを参照するため、上のコードはエラーとなる。一方このライブラリでは、this は常に不変であるため、this がベースオブジェクトの影響を受けない。このライブラリにおける配列の実装コードには this を用いていない（用いることができない）ため、this の影響を受けることなく正常に動作する。

### globalThis の参照について

globalThis に渡すオブジェクトは、子孫も含め全て別のオブジェクトに変換されてから処理される。例えば文字列は`FString`に、配列は`FArray`に変換され、どれにも変換できなかったものは`FObject`に変換される、といった具合である。また、`FValue`という型が下のように定義されている。

```typescript
type FValue = FString | FArray | FObject | …
```

ここで、`FObject`はセキュリティを強固にするため、内部で Map にしてからコードが実行されるようになっている。getGlobalThis で値を返す際に`Object`に戻る。`FArray`も同様に、内部で`unknown[]`が`FValue[]`に変換され、getGlobalThis で`unknown[]`に戻る。つまり、オブジェクトを JSON に変換するのと似たような現象が起こる。例えば下のようになる。

```javascript
// 例1

const globalThis = { obj: { x: 1 } };
const execResult = exec('this.obj.x = 2', globalThis);
const globalThisAfterExec = execResult.getGlobalThis();

console.log(globalThis.obj.x); // 一見2が出力されそうだが、実際は1
console.log(globalThisAfterExec.obj.x); // 2
```

```javascript
// 例2

const obj = { x: 1 };
const globalThis = { obj1: obj, obj2: obj };
const execResult = exec('this.obj1.x = 2; this.obj2.x;', globalThis);
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
