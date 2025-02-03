# Dockerfile

このディレクトリには、API サーバーの Dockerfile があります。[Docker Hub](https://hub.docker.com/u/kizahasi) に、これらをビルドした Docker イメージが提供されています。

Dockerfile および Docker イメージには次の 2 つがあります。

- `api-server`: API サーバーが起動されます。
- `api-server-swap256mb`: 256MB のスワップ領域を割り当ててから API サーバーが起動されます。 fly.io の無料枠などといったメモリが不足している環境で用いられることを想定しています。十分なメモリがある環境では利用しないことを推奨します。

Web サーバーの Dockerfile および Docker イメージは現時点では存在しません。
