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
                <Typography.Title level={2}>新しくなったボードの使い方</Typography.Title>
                <p>ボードウィンドウは「ボードビュアー」ウィンドウと「ボードエディター」ウィンドウに分かれました。</p>
                <p>ボードビュアーは、全員で共有されているボードが表示されるウィンドウです。ボードエディターは、自分の作ったボードを置いておくウィンドウです。</p>
                <p>ボードビュアーにボードを表示させたい場合、まずはボードエディターでボードを作成します。ボードエディターで作成されるボードはデフォルトでは全て非公開の状態です。必要であればボードエディターでボードを編集しておきます。ボードを公開する準備ができたら、ボードビューアーウィンドウの右上の「表示ボードの変更」から、自分が作ったボードを選択します。これによりボードが全員に公開されます。</p>
                <p>ボードビュアーに表示されていないボードは作成者しか閲覧、編集できませんが、ボードビュアーに表示されているボードは全参加者が閲覧、編集できます。</p>
                <p>ボードビュアーにボードを表示させる権利があるのは、そのボードの作成者のみです。つまり、他人が作ったボードを勝手に公開することは原則としてできません。</p>
                <p>ボードビュアーに誰かのボードが表示されているときでも、他のボードに置き換えることが可能です。置き換え元のボードは非公開状態に戻ります。</p>
                <p>ボードビュアーに表示されているボードを空にすることもできます。この行為は全参加者が可能です。空にするには、「表示ボードの変更」から「クリアする」を選択します。</p>

            </div> 
        </Layout>
    );
};

export default Index;