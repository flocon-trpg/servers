# docs

## caveats

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
