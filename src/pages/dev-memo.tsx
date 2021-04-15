import { Typography } from 'antd';
import React from 'react';
import Layout from '../layouts/Layout';

// TODO:
// テスト協力者に対する未完成の部分の説明や、フィードバックを得やすくするためのページ。
// 正式公開時に削除する。

const Index: React.FC = () => {
/*
<li>コマや立ち絵のエフェクト。歩行など</li>
<li>ユドナリウム的なボードの3D表示。3Dでダイスが振られる機能もついでに</li>
<li>ダイスBOT自作機能</li>
*/
    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div style={({ margin: 10 })}>
                <Typography.Title level={2}>アップデート履歴</Typography.Title>
                <Typography.Text strong>※ アップデート履歴の記述の手間を省くため、最近のアップデート内容はこのページに記載されていません。正式リリースまではDiscordに貼ってあるTrelloというサイトのほうで管理しています。</Typography.Text>
                <Typography.Title level={3}>(2021/03/25時点)</Typography.Title>
                <ul>
                    <li>より直感的に操作できるように、Boardのセルの大きさの初期値を0から50に変更</li>
                    <li>ダークテーマとコンパクトテーマを採用</li>
                    <li>アカウント登録とログインの画面にCSSを適用できていなかったため、見た目が殺風景だった問題を修正</li>
                    <li>メッセージにおけるキャラクター情報を自動連動させないようにした。メッセージに表示されるキャラクター情報は、書き込まれた時点のものが使われる</li>
                    <li>ボリュームバーを実装</li>
                    <li>SE,BGMを再生するウィンドウをちゃんとした。これにより、BGMが複数チャンネルで再生できる機能と、全員にSEやBGMを流す前にボリュームを調整できる機能が使えるようになった</li>
                    <li>同じSEを連続して流そうとすると、2回目以降は再生されないバグを修正</li>
                </ul>
                <Typography.Title level={3}>2021/03/14</Typography.Title>
                <ul>
                    <li>接続切れを起こりにくくするため、リアルタイム通信ライブラリを別のものに置き換え</li>
                    <li>プライベートメッセージの書き込みに成功したとき、書き込んだ文字列が自動的に消えなかったバグを修正</li>
                    <li>キャラクターの文字列パラメーターを編集画面で変更しようとすると落ちるバグを修正</li>
                </ul>
                <Typography.Title level={3}>2021/03/13</Typography.Title>
                <ul>
                    <li>接続切れを起こりにくくしたつもり</li>
                    <li>メッセージが荒ぶるバグを修正</li>
                    <li>大量のメッセージの表示処理をある程度軽量化</li>
                    <li>ログにダイスの結果が出力されないバグを修正</li>
                    <li>非公開にした自分の数値コマを、暫定的に括弧で囲んで表示させることでわかりやすくした</li>
                    <li>立ち絵の💬にダイスの結果が含まれるようにした</li>
                    <li>立ち絵の💬の最大行数を3程度から4程度に増加</li>
                    <li>立ち絵に💬が残る時間を15sから30sに増加</li>
                    <li>マウスホイールでなくボタンでボードを拡大縮小したとき、中央ではなく左上を基準として拡大縮小されていたバグを修正</li>
                </ul>
                <Typography.Title level={3}>2021/03/11</Typography.Title>
                <ul>
                    <li>キャラクターとして発言したとき、立ち絵に💬が出る機能とそのときに半透明化が解除される機能を追加（暫定的な措置として、フリーチャンネルでは無効化しています。また、秘話 a.k.a. プライペートメッセージでは💬や半透明化解除はトリガーされません）</li>
                    <li>数値コマの視認性を取り急ぎ上げた</li>
                    <li>数値コマの置かれる位置がずれていたバグを修正</li>
                    <li>数値コマにwebフォント(Noto Sans JP Regular)を設定</li>
                </ul>
                <Typography.Title level={3}>2021/03/10</Typography.Title>
                <ul>
                    <li>BoardとCharacterが削除可能になった</li>
                    <li>ボードが画面中央にズームするようになった</li>
                    <li>Participantがすべて退室済みになるバグを修正</li>
                </ul>
                <Typography.Title level={3}>2021/03/09</Typography.Title>
                <ul>
                    <li>立ち絵機能を実装</li>
                </ul>
                <Typography.Title level={3}>2021/03/06</Typography.Title>
                <ul>
                    <li>キャラクターの複製機能を実装</li>
                    <li>数値コマを簡易的ではあるが実装</li>
                    <li>エラー画面、読み込み画面などを改善</li>
                </ul>
                <Typography.Title level={3}>仕様</Typography.Title>
                <ul>
                    <li>[軽度] 部屋をURLから直接開いたり、新規タブで開こうとするとNot Foundになるが、これはexportモードの仕様。</li>
                </ul>
                <Typography.Title level={3}>Tips的なもの</Typography.Title>
                <p>ダイスは全角でもOK（この仕様は将来変わる可能性もあり）。例えば、{'1d100<={SAN} と 1d100≦{SAN} と １ｄ１００≦｛SAN｝ '}は同じ意味になる。ただし、この例におけるSANのようなパラメーター名の部分は全角と半角をしっかり区別する必要がある。また、仕様がまだ固まりきっていない部分もある（例: {'<='} の代わりに＜＝は使えるのか？）。</p>
                <p>例えば{'1d100 {SAN}'}は現在の仕様だと1d100とみなされるが、この仕様は将来少し変わる可能性あり。</p>
                <p>現在の仕様では、「参加者（マスター）」と通常の「参加者」は全く差がない。マスターが退室してから再入室するとその部屋にはマスターがいなくなるが、問題ない。</p>
            </div>
        </Layout>
    );
};

export default Index;