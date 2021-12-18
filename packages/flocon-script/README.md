# @flocon-trpg/flocon-script

A sandboxed JavaScript-like language interpreter in JavaScript. One of core libraries for Flocon project.

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
console.log(execResult.result); // [3]
```
