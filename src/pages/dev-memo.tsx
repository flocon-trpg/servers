/** @jsxImportSource @emotion/react */
import React from 'react';
import { Typography } from 'antd';
import Layout from '../layouts/Layout';
import { css } from '@emotion/react';

const $css = css`
pre {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 4px 4px;
}
`;

// TODO:
// テスト協力者に対する未完成の部分の説明や、フィードバックを得やすくするためのページ。
// 正式公開時に削除する。

const Index: React.FC = () => {
    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div css={$css} style={({ margin: 10 })}>
                <Typography.Title level={2}>アップデート履歴</Typography.Title>
                <Typography.Text strong>※ アップデート履歴の記述の手間を省くため、最近のアップデート内容はこのページに記載されていません。正式リリースまではDiscordに貼ってあるTrelloというサイトのほうで管理しています。</Typography.Text>

                <Typography.Title level={2}>変数、コマンド</Typography.Title>

                <Typography.Title level={3}>TOMLについて</Typography.Title>

                <p>floconでは、コマンドや変数は<a target='_blank' rel='noopener noreferrer' href='https://qiita.com/minoritea/items/c0de47b8beb813c655d4'>TOML</a>という言語を用いて記述します。ただし、このページではTOMLの仕様を読まなくてもコマンドや変数が書けるように解説していければと思います。</p>
                <p>JSONという単語を聞いたことがある方へ: TOMLとは、大雑把に言うとJSONを簡単に記述するための言語です。JSONは広く使われている言語ですが、人間が手作業で書くには面倒な部分もあります。そこで、TOMLで記述したものをJSONに変換し、そのJSONをfloconが解釈するという流れにすることで、JSONを直接記述するより楽に書くことができます(実際は、floconはTOMLをJSONに変換せずにそのまま直接解釈します。JSONに関するこの解説は、あくまでイメージです)。ですので、TOMLはJSONと似ているというイメージを片隅に置いておくともしかしたら理解しやすいかもしれません。</p>


                <Typography.Title level={3}>変数</Typography.Title>

                <p>例えばこんな感じで記述すると、HPに5という値が、敏捷に10という値が、名前に山田という値がセットされます。1行につき値を1つまでセットできます。</p>

                <pre>{`"HP" = "5"
"敏捷" = "10"
"名前" = "山田"`}
                </pre>

                <p>{'左辺のパラメーター名は、半角英数字、半角アンダーバー、半角ハイフンのみからなる場合は " を省略できます。つまり例えば、上の例は下のように書いても全く同じ意味になります。'}</p>

                <pre>{`HP = "5"
"敏捷" = "10"
"名前" = "山田"`}
                </pre>

                <p>{'右辺は原則として " を省略してはいけません（本当は数字などであれば省略できますがここでは詳しい説明は省きます）。'}</p>

                <p>{'空の行を含めても構いません。空の行は無視されます。'}</p>

                <pre>{`"HP" = "5"

"敏捷" = "10"


"名前" = "山田"`}
                </pre>

                <p>{'変数に設定した値は、チャットで{"HP"}や{"敏捷"}などとすることで取得できます(パラメーターの左辺の規則が使われます。そのため、{"HP"}は{HP}と書いても全く同じ意味になります)。キャラクターが持つパラメータと変数のパラメータの名前が重複した場合、現状では変数が優先される仕様になっています（後で変えるかもしれません）。'}</p>

                <Typography.Title level={3}>コマンド</Typography.Title>

                <p>現在、キャラクターに対するコマンドのみがとりあえず実装されています。</p>

                <p>例えば、コマンドの名前は「名称変更」で、キャラの名前を「山田」に変更するコマンドを定義するには下のようになります。コマンドの名前は自由に設定できます。「character.set.name」の部分は「該当するキャラクターの名前」を意味します(長ったらしいので少し変えるかもしれません)。</p>

                <pre>{`["名称変更"]
chara.name = "山田"`}
                </pre>

                <p>複数のコマンドを定義することもできます。例えば下は「名称変更」と「チェンジネーム」の2つのコマンドの定義になります。</p>

                <pre>{`["名称変更"]
chara.name = "山田"

["チェンジネーム"]
chara.name = "Yamada"`}
                </pre>

                <p>現状ではコマンドでできることは非常に限られており、名前と画像の変更しかできません(画像の変更を表すコマンドの設定方法は後々追加する予定です)。後々追加していく予定です。</p>

                <Typography.Title level={3}>なぜTOMLを採用したのか？</Typography.Title>

                <p>{'TOMLでは " などでくくったりしなければならない場面が多かったり、率直に言ってどどんとふと比べて少し書きにくいところもあります。それでもflocon用独自言語を定義するのではなくTOMLを採用したのは、完全な独自言語を定義できる自信がなかったからです。'}</p>

                <p>{'もし私1人の力だけで独自言語を定義するとなると、言語仕様に欠点が生じてしまい、後々機能を追加していくときに困ったことになる可能性が高いと考えられます。そこで、TOMLという既存の言語を用いることで、将来の機能拡張に耐えるシステムを作りあげるという狙いがあります。'}</p>

                <p>{'TOML以外の言語では、PythonやRubyやJavascriptやExcelのマクロのような既存のプログラミング言語で記述することも考えましたが、例えば無限ループを回避しないと使いづらいなどの問題点もあるため不採用としました。データ記述言語であればTOMLの他にXML,CSV,YAML,JSONを検討しましたが、floconのコマンドなどに採用することを考えると、この中ではTOMLがベストだと判断しました。ただ、世の中に存在する全て選択肢の中でTOMLがベストかと言われるとそこまでの自信はないため、もしかしたらより良い方法があるかもしれません。'}</p>
            </div>
        </Layout>
    );
};

export default Index;