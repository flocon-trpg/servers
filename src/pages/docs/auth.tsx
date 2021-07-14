/** @jsxImportSource @emotion/react */
import React from 'react';
import { Typography } from 'antd';
import Layout from '../../layouts/Layout';
import { css } from '@emotion/react';

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
        <Layout requiresLogin={false} showEntryForm={false}>
            <div css={$css}>
                <Typography.Title level={2}>ユーザー認証について</Typography.Title>
                <p>
                    Floconでは、メールアドレスとパスワードを用いたログインが可能であり、これによりユーザーそれぞれが独自のデータを持つことが容易になっています。ただし一般的に、パスワードを用いた認証では、パスワードなどの漏洩の対策を重視しなければなりません。漏洩の問題の大きさを考えると、趣味サイトであってもプロレベルの堅牢さを求められます。
                </p>

                <p>
                    このパスワード管理に関する問題に対する解答の1つとして、Googleが管理するFirebaseというwebサービスがあります。Firebase内にはFirebase
                    Authenticationというサービスがあり、これを用いたユーザー認証では、パスワードの管理と保存をGoogleに全て任せることができます。これにより、Googleがやらかさない限りはパスワードの漏洩リスクがほぼゼロになります。Floconでは、このFirebase
                    Authenticationを採用しています。
                </p>

                <p>
                    注意点として、Firebase
                    Authenticationではパスワードは原則として誰もアクセスすることができませんが、メールアドレスなどは保護されていません。メールアドレスはFirebase
                    Authenticationの管理画面から見ることができますし、例えばFloconのコードにバグがあって他人のメールアドレスが入手可能になってしまう可能性はゼロではありません（ただ、そのようなバグが起こる可能性は比較的低いと思います）。そのため、もし他人にばれたりネットの海に放たれたら困るメールアドレスは、使わないほうが無難かもしれません。
                </p>

                <p>
                    Firebase
                    Authenticationは、TwitterアカウントやGoogleアカウントなどを用いたログインにも対応しています。ただ、トークンなどを準備する必要があり面倒なため、このサイトでは無効にしています（途中から有効にすることもできます。また、個人サーバーごとにこれらの有効/無効を自由に設定することができます）。
                </p>

                <p>
                    Firebase
                    Authenticationには欠点もあります。1つ目は、個人サーバーの運営を始めるときに、運営者が、Firebaseのアカウント登録をしてFirebase
                    Authenticationを有効にするという作業が1つ増えることです。2つ目は、FirebaseというサービスがGoogleという1つの企業に依存していること（いわゆるベンダーロックイン）です。Firebase
                    Authenticationは現在無料プランで使えますが、例えばもし仮にGoogleが「明日から大幅値上げするよ」と言った場合、それに従わざるを得ない状況になります。また、ここでは深入りしませんが、大幅値上げではなく例えば「有料にするから無料プランでは使えなくなるよ、ただし課金額は月10円くらいの低価格だよ」といった場合でも別の大きな問題が生じます。
                </p>

                <p>
                    Firebaseのライバル的存在としてSupabaseというサービスもあります。Supabaseは上記のFirebaseの欠点をほぼ克服しています。ただし、SupabaseにはFirebaseとは別の懸念点があることと、FloconにSupabaseを加えてサポートするようにコードを書き加えるのは手間がかかるため、Firebaseに問題が生じない限りはFirebaseを引き続き採用するという方針をとる予定です。
                </p>
            </div>
        </Layout>
    );
};

export default Index;
