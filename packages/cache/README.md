# cache

API サーバーにおける単純なキャッシュ機能を実現します。[node-cache](https://www.npmjs.com/package/node-cache) と Redis の 2 つに対応しています。

ただし、現時点では API サーバーでは Redis は使われておらず、node-cache のみをサポートしています。そのため Redis に関するコードはどこからも参照されていません。

## テストの実行

`yarn run test`

テストをすべて実行するには Redis サーバーが起動している必要があります。ただし、例えば`REDIS_TEST=0 yarn run test`のように`REDIS_TEST`に falsy な値をセットすることで、Redis を使用するテストをスキップすることもできます。この場合は Redis サーバーの準備は必要ありません。
