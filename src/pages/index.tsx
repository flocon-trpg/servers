import { Alert, Button, Typography } from 'antd';
import Link from 'next/link';
import React from 'react';
import FilesManagerDrawer from '../components/FilesManagerDrawer';
import QueryResultViewer from '../components/QueryResultViewer';
import { PrereleaseType, useGetServerInfoQuery } from '../generated/graphql';
import Layout from '../layouts/Layout';
import { FilesManagerDrawerType, none } from '../utils/types';
import VERSION from '../VERSION';
import * as Icon from '@ant-design/icons';
import { alpha, apiServerRequiresUpdate, beta, rc, SemVer, webServerRequiresUpdate } from '@kizahasi/util';
import { useRouter } from 'next/router';

const Index: React.FC = () => {
    const [drawerType, setDrawerType] = React.useState<FilesManagerDrawerType | null>(null);
    const router = useRouter();

    const { data: serverInfo, loading, error } = useGetServerInfoQuery();

    const apiServerSemVer = (() => {
        if (serverInfo == null) {
            return null;
        }
        const prerelease = (() => {
            if (serverInfo.result.version.prerelease == null) {
                return undefined;
            }
            switch (serverInfo.result.version.prerelease.type) {
                case PrereleaseType.Alpha:
                    return {
                        ...serverInfo.result.version.prerelease,
                        type: alpha,
                    } as const;
                case PrereleaseType.Beta:
                    return {
                        ...serverInfo.result.version.prerelease,
                        type: beta,
                    } as const;
                case PrereleaseType.Rc:
                    return {
                        ...serverInfo.result.version.prerelease,
                        type: rc,
                    } as const;
            }
        })();
        return new SemVer({
            ...serverInfo.result.version,
            prerelease,
        });
    })();

    const versionInfo = (() => {
        if (apiServerSemVer == null) {
            return null;
        }

        const checkResult = SemVer.check({ api: apiServerSemVer, web: VERSION });

        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(checkResult === apiServerRequiresUpdate || checkResult === webServerRequiresUpdate) && <Alert type='error' showIcon message='クライアントとAPIサーバーの間に互換性がありません。' />}
            {checkResult === alpha && <Alert type='warning' showIcon message='クライアントとAPIサーバーのうち少なくとも一方がalpha版であるため、バージョンに基づく互換性は保証されません。' />}
        </div>;
    })();

    const spacing = 24;
    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
                    <Button style={{ margin: '0 0 4px 0' }} type='primary' size='large' onClick={() => router.push('/rooms')}>部屋一覧</Button>
                    <Button style={{ margin: '0 0 8px 0' }} onClick={() => setDrawerType({ openFileType: none })}>ファイルマネージャー</Button>
                    <FilesManagerDrawer drawerType={drawerType} onClose={() => setDrawerType(null)} />
                </div>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>バグと対処法</Typography.Title>
                <ul>
                    <li>ブラウザはChrome系(Edgeを含む)を推奨します。Firefoxでも概ね動きますがメッセージのスクロールが正常にできないという不具合があります。</li>
                    <li>AdblockやAdblock Plusを使用していると正常にサイトが動かないという不具合が報告されています。これらの拡張機能を無効にしてからの利用を推奨します。</li>
                </ul>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>バージョン情報</Typography.Title>
                <div>{`クライアント: ${VERSION.toString()}`}</div>
                <div>APIサーバー: {loading ? <span><Icon.LoadingOutlined />取得中…</span> : (apiServerSemVer == null ? '(エラーが発生しました)' : apiServerSemVer.toString())}</div>
                <QueryResultViewer error={error} loading={false} compact>
                    {versionInfo}
                </QueryResultViewer>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>ドキュメント、コラムなど</Typography.Title>
                <ul>
                    <li><Link href='/docs/auth'>Floconにおけるユーザー認証の仕組み</Link> (New! 2021/06/09)</li>
                    <li><Link href='/docs/storage'>ファイルアップローダーの仕様</Link> (New! 2021/06/09)</li>
                    <li><Link href='/docs/board'>新しくなったボードの使い方</Link> (2021/05/29)</li>
                    <li><Link href='/docs/toml'>変数、コマンド</Link></li>
                    <li><Link href='/docs/dev-memo'>制作メモ、更新履歴など</Link></li>
                </ul>
            </div>
        </Layout>
    );
};

export default Index;