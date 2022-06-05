# ot ディレクトリにあるコードについて

Flocon の部屋(Room)を Operational Transformation を用いて編集する機能を提供している。ログを表すオブジェクトを生成する関数も付属している。

多くの関数は`./template`のコードで自動的に生成している。ただし、toClientState は閲覧権限、serverTransform は編集権限の処理が行われているため、手動で作っている。この 2 つの関数は`./flocon`にある。基準となるのは`./room`にある`functions.ts`。ただし Room には例えば Bgm や Participant などが 1:N の関係で存在しており、これらを 1 つのファイルで表すとあまりにもコードが長くなるため、`./room/bgm`や`./room/participant`などに分割している。

## \$v と\$r

State や Operation の定義を変更した場合、変更した型自身および影響のある型の\$v もしくは\$r の値を 1 増やす。\$v は version、\$r は revision を表す。2 つの型があって\$v が等しいが\$r が異なる場合は\$r の高いほうに変換可能であり互換性があることを示す。この変換処理は migrate.ts に書く。$v が異なる場合は互換性がないため、このライブラリでは片方のサポートを停止するか、両方のバージョンをサポートしなければならない。

## functions.ts

クライアントに State を渡すのは文字通り toClientState で行う。クライアントに Operation を渡すには、toClientState(prevState)と toClientState(nextState)を求めてから diff する。かつては toClientOperation を定義しておりそれを用いていたが、activeBoardId（旧 activeBoardKey） が後で追加され、activeBoardId が変わったときにそれに伴う Piece の変更も含めなければならず、さらに Piece を子に持つ Character、DicePieceValue にも変更を反映させなければならず… ということをしなければならなくなり、toClientOperation を使うのはパフォーマンスこそいいもののロジックが複雑化して大変なので diff を取る作戦を採用することにした。ただ、パフォーマンスのために activeBoardId が絡まない部分だけ toClientOperation を用い、残りは diff を用いるという折衷案もありかもしれない。

Participant の Role などは、クライアント側による operation では変更できず、サーバーによる operation でしか変更できない仕様にしている。そのため、クライアント側で Role を変更する Operation を作成するべきではない(もしそのような Operation をサーバーに送信しても無視される)。ただし、サーバーから受け取った Operation に Role の変更が含まれていて、その Operation をクライアントの State に apply したり、clientTransform することは頻繁に行われる。

composeDownOperation は、例えば { oldValue: 1, newValue: undefined }, { oldValue:undefined, newValue: 2 } を compose したときにこれは update になるべきだが実際は{ oldValue:1 }の replace となるという仕様がある。このままでは不具合が起こるが、restore で TwoWayOperation に変換する工程で update になるため、最終的に正常な状態になる。

現状の仕様だと、API 側の OT は、「composeDownOperation でまとめる →restore で正常な twoWayOperation にする」という流れになっている。だが、これは「逐次 restore していく →composeTwoWayOperation でまとめる」にするほうが綺麗。パフォーマンスに関しては restore の回数が増えるので state を更新する回数も増えるため、この点でパフォーマンスが悪くなる可能性があるが、operation が肥大でない限り、diff と比べればそこまで重くないと思われる。あわせて composeDownOperation は廃止できる。ただし、書き換えが面倒なのと、newValue の設定をしなくていいというメリットはあるのと、restore による正常化という特殊な工程はすべて recordOperation 系が担っているので、とりあえず現状維持の方針。

## その他

### io-ts の brand vs serverTransform

名前やメモなどに長過ぎる文字列を設定してストレージ空き容量を枯渇させる攻撃対策として、serverTransform で弾く方法と、io-ts の brand を使う方法の 2 つを検討した。

前者のメリットは下の通り。

-   例えば「権限が一定以下の場合のみ制限をかける」「1 ユーザーあたりの全てのメモの合計字数は x 文字までとする」といった複雑なケースに対応できる。
-   制約を変更するには serverTransform の関数を書き換えるだけで良い。brand を使う場合だが、まず migration で変換するケースを考えてみる。例えば 101 文字以上のメモが作成されている状態でメモ本文の制約を「無制限の string」から「100 文字までの string」に厳しくする場合、単に migration するとメモの一部が消失するという問題点がある。また、DownOperation を整合性を保ったまま migration するのはミスの余地があるためリスクがある。DownOperation の migration を不可能にするという対処法も考えられるが、編集履歴閲覧やバックアップ復元機能に用いる可能性もあるため難しいか。制約変更前バージョンと現行バージョンの 2 つを同時にサポートするという手もあるが、これもコードが複雑化するという問題点がある。いっぽう serverTransform では「制限を厳しくしてそれによって文字数が許容量を超えても直ちに削除しないが、文字を増やす変更は許さない」などといった柔軟な運用も可能。
-   ユーザーごとに異なった制限を適用することが容易。
-   コマンド機能で入力された文字列をチェックする必要がない。

後者のメリットは下の通り。

-   型と制約が一体化しているため、確実に制約を守らせることができ、ドキュメントとしての役割を果たす。また、io-ts の機能により、値が制約を満たしているかを直接なおかつ確実に検証できる。

どちらも一長一短であるため、次のすべてを満たす場合は brand を、そうでない場合は serverTransform を用いる、という方針で使い分けるようにしている。

-   brand で記述可能。
-   制約が変わらない、もしくは変更されるとしても緩くなるのみ。
-   ユーザーが設定で変更できなくても構わない。

brand を使う具体例は下のとおり。

-   整数
-   正の数
-   メールアドレス

### コマのログ

コマのログを非公開状態にしている状態で値をこっそり変える不正への対策が求められたため、ログ機能を実装した。コマの単なる diff は非公開の値に対して有効に働かないので、ログ専用の型を定義している。

ただしもう 1 つの方法として、コマログ用 State を定義する手も考えられる、value をランダムな ID とし、値が変わったら value も変える、とすることで、Operation の履歴をたどればログに相当するものが自動的に生成できる。このコマログ用 State はサーバーのみが変更可能。利点は、State の枠で管理できるためログ専用の型のような特別な処理が必要なく、またデータベースにもログを独立した形で保存しなくてもよくなること。欠点は、Operation の履歴の閲覧機能を実装する必要があることと、ログだけが必要な場合でもログに関わらない Operation の履歴も残す必要があること（Heroku の Postgres のように Row の個数に制限がある場合、Operation の履歴はあまり残したくないと思われる）。現在は Operation の履歴の閲覧機能を実装できていないため、この方法は見送り。

[^1]: composeUpOperation や composeTwoWayOperation は、現時点で使う場面がないため実装していません。
