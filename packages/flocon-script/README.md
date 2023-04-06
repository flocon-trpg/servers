# flocon-script

JavaScript をサンドボックス環境で実行します。ただし全ての機能には対応していません。

将来、このパッケージは削除して、代わりに ShadowRealm や [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)などに置き換える予定です。

## Usage

```typescript
import {
    exec,
    arrayClass,
    mapClass,
    symbolClass,
    createConsoleClass,
} from '@kizahasi/flocon-script';

const globalThis = {
    Array: arrayClass,
    Map: mapClass,
    Symbol: symbolClass,
    console: createConsoleClass('[MY HEADER!]'),
};
const execResult = exec(
    `
const i = 1 + 2;
const array = [i];
console.log(Array.isArray(array));
array
`,
    globalThis
);
// console.log(Array.isArray(array)); が実行され、"[MY HEADER!] true"が出力される

console.log(execResult.result);
// => [3]
```

## テストの実行

`yarn run test`
