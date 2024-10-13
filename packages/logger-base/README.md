# logger-base

文字列のみを export するシンプルなパッケージです。

これらの文字列は、当初は `@flocon-trpg/default-pino-transport` に含まれていましたが、`@flocon-trpg/utils` で `import { notice } from '@flocon-trpg/default-pino-transport'` という記述があるだけで、Next.js で静的ファイルを生成する際に次のエラーが出たため、独立させています。

```
../../node_modules/pino-abstract-transport/index.js
Module not found: Can't resolve 'worker_threads' in '/home/runner/work/servers/servers/node_modules/pino-abstract-transport'

Import trace for requested module:
../../node_modules/pino-abstract-transport/index.js
../../packages/default-pino-transport/dist/esm/index.js
../../packages/utils/dist/esm/index.js
```
