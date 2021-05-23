import { Typography } from 'antd';
import React from 'react';
import Layout from '../layouts/Layout';

// TODO:
// テスト協力者に対する未完成の部分の説明や、フィードバックを得やすくするためのページ。
// 正式公開時に削除する。

const Index: React.FC = () => {
    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div style={({ margin: 10 })}>
                <Typography.Title level={2}>アップデート履歴</Typography.Title>
                <Typography.Text strong>※ アップデート履歴の記述の手間を省くため、最近のアップデート内容はこのページに記載されていません。正式リリースまではDiscordに貼ってあるTrelloというサイトのほうで管理しています。</Typography.Text>
            </div>
        </Layout>
    );
};

export default Index;