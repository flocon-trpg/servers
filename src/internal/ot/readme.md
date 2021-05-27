# Operational Transformation library

io-tsでは、Recordのkeyをstringにすることはできるが、例えば ('1' | '2' | '3') にすることはシンプルな方法で実現できない模様。そのため、代わりにstringを使っている。

権限の処理(例えばisPrivate === true の値は作成者以外の編集を拒否するなど)は、全てserverTransformで行う。

一部の人には閲覧できない値を除外する作業は、全てtoClientStateとtoClientOperationで行う。

ParticipantのRoleなどは、サーバー以外はoperationによって変更できない。そのため、クライアント側でRoleを変更するOperationを作成するべきではない(もしそのようなOperationをサーバーに送信しても無視される)。ただし、サーバーから受け取ったOperationにRoleの変更が含まれていて、そのOperationをクライアントのStateにapplyしたり、clientTransformする機会はある。

io-ts のインスタンスにおける T | null | undefined (a.k.a. Maybe&lt;T&gt;)で、nullとundefinedは通常は常に同じ意味。理由は、io-tsにおけるnullとundefinedの挙動をよく知らないため、とりあえずMaybe&lt;T&gt;にしておけば確実かなと思ったから。あまり良くない。

composeDownOperationは、例えば { oldValue: undefined, newValue: 1 }, { oldValue:1, newValue: undefined } をcomposeしたときにこれはidになるべき(oldValueとnewValueのうち1つのみがnullishであるべき)だがidにできないという仕様があるため注意。composeUpOperationも同様。
