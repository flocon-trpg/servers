# example of docker build:
# docker build -f api-server.Dockerfile -t flocon-api --build-arg branch="api/v0.6.1-beta.5" . 


FROM node:16-bullseye as build

# branchという名前ですが、ブランチではなくタグも指定できます。
# これを変更することで、デプロイするAPIサーバーのバージョンを変更できます。
ARG branch="release"

WORKDIR /app

# disables git cache: https://stackoverflow.com/a/39278224
ADD https://api.github.com/repos/flocon-trpg/servers/git/refs/heads version.json

RUN git clone https://github.com/flocon-trpg/servers.git -b $branch --depth 1

WORKDIR /app/servers/apps/api-server

RUN yarn workspaces focus

RUN yarn run build

WORKDIR /app/servers

# simple cleanup for the next COPY
RUN rm -rf ./.git
RUN rm -rf ./.github
RUN rm -rf ./.husky
RUN rm -rf ./.yarn/cache
RUN rm -rf ./apps/web-server


FROM node:16-bullseye-slim

WORKDIR /app

RUN useradd floconapi

COPY --from=build --chown=floconapi /app/servers .

WORKDIR /app/apps/api-server

USER floconapi

CMD ["yarn", "run", "start"]