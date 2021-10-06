# ot ディレクトリにあるコードについて

Flocon の部屋(Room)を Operational Transformation を用いて編集する機能を提供している。ログを表すオブジェクトを生成する関数も付属している。

中核となるのは`./room`にある`functions.ts`と`types.ts`。ただし Room には例えば Bgm や Participant などが 1:N の関係で存在しており、これらを 1 つのファイルで表すとあまりにもコードが長くなるため、`./room/bgm`や`./room/participant`などに分割している。

## types.ts

型の定義と、io-ts を用いて型チェックを行う関数を提供する。

io-ts では、Record の key を string にすることはできるが、例えば ('1' | '2' | '3') にすることはシンプルな方法で実現できない模様。そのため、代わりに string を使っている。

## functions.ts

権限の処理(例えば isPrivate === true の値は作成者以外の編集を拒否するなど)は、全て serverTransform で行う。

一部の人には閲覧できない値を除外する作業は、全て toClientState で行う。

クライアントに State を渡すのは文字通り toClientState で行う。クライアントに Operation を渡すには、toClientState(prevState)と toClientState(nextState)を求めてから diff する。かつては toClientOperation を定義しておりそれを用いていたが、activeBoardKey が後で追加され、activeBoardKey 変わったときにそれに伴う Piece の変更も含めなければならず、さらに Piece を子に持つ Character、DicePieceValue にも変更を反映させなければならず… ということをしなければならなくなり、toClientOperation を使うのはパフォーマンスこそいいもののロジックが複雑化して大変なので diff を取る作戦を採用することにした。ただ、パフォーマンスのために activeBoardKey が絡まない部分だけ toClientOperation を用い、残りは diff を用いるという折衷案もありかもしれない。

Participant の Role などは、クライアント側による operation では変更できず、サーバーによる operation でしか変更できない仕様にしている。そのため、クライアント側で Role を変更する Operation を作成するべきではない(もしそのような Operation をサーバーに送信しても無視される)。ただし、サーバーから受け取った Operation に Role の変更が含まれていて、その Operation をクライアントの State に apply したり、clientTransform する機会はある。

io-ts のインスタンスにおける T | null | undefined (a.k.a. Maybe&lt;T&gt;)で、null と undefined は通常は常に同じ意味。理由は、io-ts における null と undefined の挙動をよく知らないため、とりあえず Maybe&lt;T&gt;にしておけば確実かなと思ったから。あまり良くない。

board,character などの first key は userUid(participant の first key)と等しい。これらを participant の子として持たせていない理由は、Undo や Redo 処理を participant の削除などなしで行いやすくするため。

composeDownOperation は、例えば { oldValue: 1, newValue: undefined }, { oldValue:undefined, newValue: 2 } を compose したときにこれは update になるべきだが実際は{oldValue:undefined}の replace となるという仕様がある。このままでは不具合が起こるが、restore で TwoWayOperation に変換する工程で update になるため、最終的に正常な状態になる。

composeUpOperation（ともしかしたら apply,applyBack）にも同様の仕様があるが、これらは昔は意味があったがおそらく今はない。composeUpOperation は現状では存在意義がないので削除した。

現状の仕様だと、API 側の OT は、「composeDownOperation でまとめる →restore で正常な twoWayOperation にする」という流れになっている。だが、これは「逐次 restore していく →composeTwoWayOperation でまとめる」にするほうが綺麗。パフォーマンスに関しては restore の回数が増えるので state を更新する回数も増えるため、この点でパフォーマンスが悪くなる可能性があるが、operation が肥大でない限り、diff と比べればそこまで重くないと思われる。あわせて composeDownOperation は廃止できる。ただし、書き換えが面倒なのと、newValue の設定をしなくていいというメリットはあるのと、restore による正常化という特殊な工程はすべて recordOperation 系に任せているので、とりあえず現状維持の方針。
