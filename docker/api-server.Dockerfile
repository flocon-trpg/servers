# example of docker build:
# docker build -f api-server.Dockerfile -t flocon-api --build-arg branch="v0.6.1-beta.1" . 


FROM node:16-bullseye as build

# we can set a tag to this instead of a branch 
ARG branch="release"

WORKDIR /app

# disables git cache: https://stackoverflow.com/a/39278224
ADD https://api.github.com/repos/flocon-trpg/servers/git/refs/heads version.json

RUN git clone https://github.com/flocon-trpg/servers.git -b $branch --depth 1

WORKDIR /app/servers/packages/api-server

RUN yarn workspaces focus

RUN yarn run build

WORKDIR /app/servers

# simple cleanup for the next COPY
RUN rm -rf ./.git
RUN rm -rf ./.github
RUN rm -rf ./.husky
RUN rm -rf ./.yarn/cache
RUN rm -rf ./packages/web-server


FROM node:16-bullseye-slim

WORKDIR /app

RUN useradd floconapi

COPY --from=build --chown=floconapi /app/servers .

WORKDIR /app/packages/api-server

USER floconapi

CMD ["yarn", "run", "start"]