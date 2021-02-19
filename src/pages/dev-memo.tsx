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
                <Typography.Title level={2}>開発メモ</Typography.Title>
                <Typography.Title level={3}>実装予定の機能</Typography.Title>
                <ul>
                    <li>管理者機能<br />管理者は専用のメニューやボタンなどが画面に追加され、部屋を無制限に削除できるなどの権限を持つ予定。</li>
                </ul>
                <Typography.Title level={3}>まだ未実装の機能</Typography.Title>
                漏れがあるかも。また、優先度が非常に低いものは記載していない。
                <Typography.Title level={4}>優先度中～高</Typography.Title>
                <ul>
                    <li>ダイスコマなどのコマ</li>
                    <li>個々人のボリュームバー</li>
                    <li>カットイン画像</li>
                    <li>メッセージを一部のタブにまとめるなど</li>
                    <li>Boardウィンドウがズームする方向を、左上でなく中央にする</li>
                    <li>チャットの文字色</li>
                    <li>複数BGMの同時再生（現在はBGMは同時に1つしか流せない。同時に流そうとした場合、前のBGMは強制的に停止する）。これは実装間近</li>
                    <li>イニシアチブ表関係。キャラクターのテーブルをパラメーターごとにソート（ソート設定は他人と共有されない予定。自分だけに影響する）。</li>
                    <li>誰かがチャットを書き込み中ということを示す</li>
                    <li>その他、英語の部分がまだ残っている</li>
                    <li>デザインはまだ洗練されてない場所が多い。例えば全体的に白背景で殺風景。また、出力したログやチャットの見た目（特にダイスを振ったとき）も現段階ではおそらく不格好でわかりにくい。</li>
                    <li>部屋のブックマーク</li>
                    <li>（一般公開するまでに）マニュアルおよび配布サイトの作成</li>
                </ul>
                <Typography.Title level={4}>優先度低</Typography.Title>
                <ul>
                    <li>点呼</li>
                    <li>投票</li>
                    <li>立ち絵（画像を表示すること自体はそこまで難しくないが、どのような形で立ち絵を表現するのかが悩みどころ）</li>
                    <li>Firebase Storageを使わないファイルアップローダー（Firebase Storageを用いたファイルアップローダーと併用可）</li>
                    <li>APIの仕様を固める。そうすれば親切な第三者がもっとかっこいいUIやモバイル版UIを作ってくれるかも？</li>
                </ul>
                <Typography.Title level={3}>未決定事項</Typography.Title>
                <Typography.Title level={4}>大きさ</Typography.Title>
                現在はボタンなどは全体的に小さめにしているが、コードを変えてコンパクトモードをONにすることでさらに小さくできる。コンパクトモードをONにしたうえで、小さすぎて見にくい部分だけ大きくすることもできる。
                <Typography.Title level={5}>現在の設定</Typography.Title>
                <img src='/images/rooms/default.png' />
                <Typography.Title level={5}>コンパクトモードON</Typography.Title>
                <img src='/images/rooms/compact.png' />
                <Typography.Title level={4}>ダークテーマ</Typography.Title>
                使っているライブラリにはダークテーマもある。ダークテーマだと画面が全体的に暗めなので目が疲れにくいらしいが、ココフォリアっぽさが強い気がする。なお、↓の画像は見ての通りただ単にダークテーマをONにしただけで調整は一切していない状態。もしダークテーマを採用する場合はちゃんと全部暗くする。可能であればダークテーマのON/OFFをサーバー管理者もしくはユーザーが自由に切り替えられるのが理想だが、チャットの文字色など課題もある。
                <img src='/images/rooms/dark.png' />
                <Typography.Title level={4}>その他</Typography.Title>
                <ul>
                    <li>どどんとふなどではトップページに部屋一覧があるが、Floconではトップページからいったん部屋一覧ページを経由して部屋に入る必要があるため少し煩わしい。ただ、将来floconの機能が拡充していってページの情報量が非常に多くなり、結局これらのページはわけたままのほうがいい状態になる可能性もなくはないためまだなんともいえない。</li>
                    <li>誰かがチャットで発言したときに出る通知。どのような形、条件で通知するかが悩みどころ。</li>
                    <li>チャットパレットもしくはそれに相当する機能の仕様。チャットの末尾発動も同様。どどんとふの仕様は見た感じだとグダり気味なので、刷新した形で実装するのが理想。</li>
                    <li>どどんとふにおける$choiceなどといったスクリプト的なもの。もし実装するならこちらも刷新した形でやりたい。</li>
                </ul>
                <Typography.Title level={3}>バグ、不具合</Typography.Title>
                <ul>
                    <li>[軽度] Chromeだと、部屋に初めて入室した際にBoardウィンドウが表示されない？少し操作すると直る。</li>
                    <li>[軽度～中度] キャラクターなどを操作したとき動作が全体的にもっさりしている。</li>
                    <li>[軽度] 多くの環境で、部屋でウィンドウを右下に持っていくと白い背景の部分が見えてしまう（ちなみにこのページでも同じことが起こる）。<br /><img src='/images/rooms/issue.png' /></li>
                </ul>
                <Typography.Title level={3}>Tips的なもの</Typography.Title>
                <p>ダイスは全角でもOK（この仕様は将来変わる可能性もあり）。例えば、{'1d100<={SAN} と 1d100≦{SAN} と １ｄ１００≦｛SAN｝ '}は同じ意味になる。ただし、この例におけるSANのようなパラメーター名の部分は全角と半角をしっかり区別する必要がある。また、仕様がまだ固まりきっていない部分もある（例: {'<='} の代わりに＜＝は使えるのか？）。</p>
                <p>以前の仕様では、ゲームの種類を指定しないとダイスを振ることはできなかったが、現在は指定していない場合diceBotが使われるようになっている。</p>
            </div>
        </Layout>
    );
};

export default Index;