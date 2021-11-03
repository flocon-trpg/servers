# @kizahasi/flocon-script

A sandboxed JavaScript-like language interpreter in JavaScript. One of core libraries for Flocon project.

![GitHub](https://img.shields.io/github/license/kizahasi/flocon-script) [![npm version](https://img.shields.io/npm/v/@kizahasi/flocon-script.svg?style=flat)](https://www.npmjs.com/package/@kizahasi/flocon-script) [![CI](https://github.com/kizahasi/flocon-script/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kizahasi/flocon-script/actions/workflows/ci.yml) [![publish](https://github.com/kizahasi/flocon-script/actions/workflows/publish.yml/badge.svg?branch=release)](https://github.com/kizahasi/flocon-script/actions/workflows/publish.yml)

## Install

`npm install @kizahasi/flocon-script` or `yarn add @kizahasi/flocon-script`

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

## License

Released under MIT License
