---
title: "Vercelに設置"
sidebar_position: 1
---

# Vercel に設置する方法

（書きかけ）

`FRAMEWORK PRESET` が `Next.js` になっていることを確認します。

## Build & Development Settings

`Settings`の`Build & Development Settings`を次のように設定します。

![1.png](/img/docs/vercel/1.png)

| キー                  | 値                                                     |
| --------------------- | ------------------------------------------------------ |
| `BUILD COMMAND`       | `yarn --cwd apps/web-server build`                     |
| `OUTPUT DIRECTORY`    | `apps/web-server/.next`                                |
| `INSTALL COMMAND`     | 変更しない                                             |
| `DEVELOPMENT COMMAND` | 画像では変更されていますが、変更する必要はありません |

## Environmental Variables

[Web サーバー公式設定ツール](https://tools.flocon.app/web-server) を用いて、Vercel の Environmental Variables を設定します。
