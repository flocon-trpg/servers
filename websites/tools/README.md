# tools

https://tools.flocon.app のソースコードです。

本来は https://flocon.app ([@flocon-trpg/docs](../docs)) と一緒にしたいのですが、@flocon-trpg/docs で使っている [Docusaurus のグローバル css を無効化する方法がない](https://github.com/facebook/docusaurus/issues/6032)ため、やむなく分離させ、別々のサイトとしてデプロイしています。

Shadow DOM (react-shadow など)を用いる方法も考えましたが、Ant Design の CSS のセットなどの手間がかかることと、予期せぬトラブルが発声する可能性を考慮して現時点では不採用としました。ただしこの方針は将来変わる可能性があります。
