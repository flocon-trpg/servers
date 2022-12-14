# このDockerfileでビルドされたイメージを使用すると、スワップ領域を追加した上でAPIサーバーが起動します。いっぽう、../api-server/Dockerfile ではスワップ領域の追加を行わずにAPIサーバーが起動します。また、rootlessコンテナとして動きます。
# fly.ioの無料枠のインスタンスなどといった、メモリが非常に少ない環境の場合は、このDockerfileでビルドされたイメージを使わないとメモリ不足により正常に動きません。対して十分なメモリがある場合は、代わりに ../api-server/Dockerfile でビルドされたイメージのほうを使用することを推奨します。

# example of docker build:
# docker build -t flocon-api-swap256mb --build-arg branch="api/v0.7.7" . 

FROM node:19-bullseye as build

# branchという名前ですが、ブランチではなくタグも指定できます。
# これを変更することで、デプロイするAPIサーバーのバージョンを変更できます。
ARG branch="release"

WORKDIR /app

# disables git cache: https://stackoverflow.com/a/39278224
ADD https://api.github.com/repos/flocon-trpg/servers/git/refs/heads version.json

RUN git clone https://github.com/flocon-trpg/servers.git -b $branch --depth 1

WORKDIR /app/servers/apps/api-server

RUN yarn workspaces focus

WORKDIR /app/servers

# simple cleanup for the next COPY
RUN rm -rf ./.git
RUN rm -rf ./.github
RUN rm -rf ./.husky
RUN rm -rf ./.yarn/cache
RUN rm -rf ./apps/web-server


FROM node:19-bullseye-slim

WORKDIR /app

COPY --from=build /app/servers .

WORKDIR /app/apps/api-server

CMD fallocate -l 256MB ./swapfile; chmod 600 ./swapfile; mkswap ./swapfile; swapon ./swapfile; yarn run start