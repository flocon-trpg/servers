---
sidebar_position: 1
---

# 設置方法について

FloconのWebサーバーはNext.jsを使用しているため、Vercelなどにデプロイできます。その一方で、Next.jsは静的なHTMLファイルなどをエクスポートできる機能があり、これを用いることでVercel以外の様々なホスティングサービスにデプロイしたり、オンプレミスサーバーに設置したりすることもできます。

通常は、もしGitHubと連携して自動的にビルドさせたい場合はVercelなどにデプロイし、もしGitHubと連携せずに直接デプロイしたい場合は[リリース一覧](https://github.com/flocon-trpg/servers/releases)から`flocon_web_server.zip`を利用するのが最も簡単だと思います。後者の方法は[チュートリアルのページ](/docs/server/tutorial/web_server)に解説があります。このチュートリアルの解説ではNetlifyにデプロイする方法を説明していますが、Netlify以外にも応用可能です。
