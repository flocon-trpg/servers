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
                <Typography.Title level={2}>アップデート履歴</Typography.Title>
                <Typography.Text strong>※ アップデート履歴の記述の手間を省くため、最近のアップデート内容はこのページに記載されていません。正式リリースまではDiscordに貼ってあるTrelloというサイトのほうで管理しています。</Typography.Text>

            </div> 
        </Layout>
    );
};

export default Index;