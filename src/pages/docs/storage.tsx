/** @jsxImportSource @emotion/react */
import React from 'react';
import { Typography } from 'antd';
import Layout from '../../layouts/Layout';
import { css } from '@emotion/react';
import Link from 'next/link';

const $css = css`
    padding: 32px;
    pre {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 4px;
    }
`;

// TODO:
// 正式公開時に削除する。

const Index: React.FC = () => {
    return (
        <Layout>
            <div css={$css}>
                <Typography.Title level={2}>ファイルアップローダーについて</Typography.Title>

                <Typography.Title level={3}>
                    現在のファイルアップローダーに関する仕様
                </Typography.Title>

                <p>
                    Floconでは
                    <Link href='/docs/auth'>
                        ユーザー認証にFirebase Authenticationというサービスを用いています。
                    </Link>
                    FirebaseにはFirebase Authenticationの他にFirebase
                    Storageというファイル保存サービスがあり、これを用いると簡単にファイルアップローダーを実装できるため、とりあえず現時点ではFirebase
                    Storageを用いたファイルアップローダーのみを提供しています。
                </p>

                <p>Firebase Storageを用いたアップローダーのメリットは下のとおりです。</p>
                <ul>
                    <li>実装が簡単</li>
                    <li>ファイルの送受信という重めの処理をGoogleに任せることができる</li>
                    <li>
                        （APIサーバーを動かす場所によるが）APIサーバーの通信費を抑えることができる
                    </li>
                </ul>

                <p>
                    一方で、下のようなデメリットもあります（Firebase FunctionsやGoogle Cloud
                    Functionsを用いることで解決できるものもありますが、これらには別の問題点があります）。
                </p>
                <ul>
                    <li>
                        細かい権限設定が困難。例えば、サイトのパスフレーズ入力に成功したユーザーのみアップローダーにアクセス可能にする、などといったことができない。
                    </li>
                    <li>
                        画像のサムネイル作成が困難。このため、ファイル一覧画面に画像のサムネイルを表示させることができない。
                    </li>
                    <li>
                        アップローダー内にユーザーごとに好きなフォルダを作成などといった、少し複雑な機能の実装が困難。
                    </li>
                    <li>Googleが管理するため、違法と判断されたファイルは削除されるかも？</li>
                </ul>

                <p>
                    これらのデメリットのうちいくつかは、例えばDropboxにアップロードされたファイルを直接指定するという方法で現状でもある程度回避できます。また、将来はFirebase
                    StorageではなくFlocon独自のアップローダーも実装することも考えています。もし実装した場合は、従来のFirebase
                    Storageによるアップローダーと併用させることもできるようにする予定です。
                </p>

                <Typography.Title level={3}>ファイルの種類の自動分類について</Typography.Title>

                <p>
                    Firebase
                    Storageによる制限の多いアップローダーである程度ファイルを分類して表示できるようにするために、拡張子によるファイル分類機能を搭載しています。ただし、これはあくまで簡易的な分類であるため、例えば画像ファイルでないのに画像ファイルと判定される、ということが起こりえます。
                </p>

                <p>
                    また、音声フォーマットはブラウザごとに対応状況が異なるものがあります。例えばoggはChromeやFirefoxなどでは再生可能ですが、Safariでは再生できません。これに関してはmp3などの無難なフォーマットであればまず間違いなくどの環境でも再生できると思います。
                </p>

                <p>
                    参考までに、2021/06/09現在の拡張子判定のコードは下のようになっています。jpg～webpが画像ファイル、mp3～webaが音声ファイル、それ以外はその他という具合です。
                </p>

                <img src='/file-types.png' width={361} height={406} />
            </div>
        </Layout>
    );
};

export default Index;
