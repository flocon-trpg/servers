/** @jsxImportSource @emotion/react */
import React from 'react';
import { Typography } from 'antd';
import { Layout } from '../../components/ui/Layout';
import { css } from '@emotion/react';

const $css = css`
    padding: 32px;
    pre {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 4px;
    }
`;

const Index: React.FC = () => {
    return (
        <Layout>
            <div css={$css}>
                <Typography.Title level={2}>ボードの使い方</Typography.Title>
                <p>
                    ボードウィンドウは「ボードビュアー」ウィンドウと「ボードエディター」ウィンドウの2つがあります。
                </p>
                <p>
                    ボードビュアーは、全員が閲覧するウィンドウです。ボードエディターは、自分の作ったボードを置いておくウィンドウです。
                </p>
                <p>
                    ボードビュアーにボードを表示させたい場合、まずはボードエディターでボードを作成します。ボードエディターで作成されるボードはデフォルトでは全て非公開の状態です。ボードを公開する準備ができたら、ボードビュアーウィンドウの右上の「表示ボードの変更」から、自分が作ったボードを選択します。これによりボードが全員に公開されます。
                </p>
                <p>
                    ボードビュアーに表示されていないボードは作成者しか閲覧、編集できませんが、ボードビュアーに表示されているボードは全入室者が閲覧、編集できます。
                </p>
                <p>
                    ボードビュアーにボードを表示させる権利があるのは、そのボードの作成者のみです。つまり、他人が作ったボードを勝手に公開することは原則としてできません。
                </p>
                <p>ボードビュアーに表示するボードの変更は、参加者であれば誰でも可能です。</p>
            </div>
        </Layout>
    );
};

export default Index;
