# Operational Transformation library

io-tsでは、Recordのkeyをstringにすることはできるが、例えば ('1' | '2' | '3') にすることはシンプルな方法で実現できない模様。そのため、代わりにstringを使っている。

権限の処理(例えばisPrivate === true の値は作成者以外の編集を拒否するなど)は、全てserverTransformで行う。

一部の人には閲覧できない値を除外する作業は、全てtoClientStateとtoClientOperationで行う。

ParticipantのRoleなどは、クライアント側によるoperationでは変更できず、サーバーによるoperationでしか変更できない仕様にしている。そのため、クライアント側でRoleを変更するOperationを作成するべきではない(もしそのようなOperationをサーバーに送信しても無視される)。ただし、サーバーから受け取ったOperationにRoleの変更が含まれていて、そのOperationをクライアントのStateにapplyしたり、clientTransformする機会はある。

io-ts のインスタンスにおける T | null | undefined (a.k.a. Maybe&lt;T&gt;)で、nullとundefinedは通常は常に同じ意味。理由は、io-tsにおけるnullとundefinedの挙動をよく知らないため、とりあえずMaybe&lt;T&gt;にしておけば確実かなと思ったから。あまり良くない。

composeUpOperationは、例えば { oldValue: undefined, newValue: 1 }, { oldValue:1, newValue: undefined } をcomposeしたときにこれはidになるべき(oldValueとnewValueのうち1つのみがnullishであるべき)だがidにできないという仕様があるため注意。composeDownOperationも同様。

上のようなcomposeはエラーにするほうが仕様としてわかりやすくなると思うが、composeUpOperationでは、実際は{newValue:undefined}のreplaceとして成功するようになっている。また同時に、元々存在しない要素に対して{newValue:undefined}をapplyしようとした場合、こちらもエラーにするほうが仕様としてわかりやすくなると思うが、こちらもエラーにならない。これらはかつて意味があった挙動だが、今はおそらく必要ないかもしれない。

board,characterなどのfirst keyはuserUid(participantのfirst key)と等しい。これらをparticipantの子として持たせていない理由は、UndoやRedo処理をparticipantの削除などなしで行いやすくするため。
