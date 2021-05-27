import { Alert, Button } from 'antd';
import Link from 'next/link';
import React from 'react';
import FilesManagerDrawer from '../components/FilesManagerDrawer';
import QueryResultViewer from '../foundations/QueryResultViewer';
import { PrereleaseType, useGetServerInfoQuery } from '../generated/graphql';
import Layout from '../layouts/Layout';
import { FilesManagerDrawerType, none } from '../utils/types';
import VERSION from '../VERSION';
import * as Icon from '@ant-design/icons';
import { alpha, apiServerRequiresUpdate, beta, rc, SemVer, webServerRequiresUpdate } from '@kizahasi/util';

const Index: React.FC = () => {
    const [drawerType, setDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

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

    return (
        <Layout requiresLogin={false} showEntryForm={false}>
            <div>
                <Link href='/rooms'>部屋一覧</Link>
                <Button onClick={() => setDrawerType({ openFileType: none })}>Open Files Manager</Button>
                <Link href='/dev-memo'>制作メモ、更新履歴など</Link>
                <FilesManagerDrawer drawerType={drawerType} onClose={() => setDrawerType(null)} />
            </div>
            <h2>バージョン情報</h2>
            <div>{`クライアント: ${VERSION.toString()}`}</div>
            <div>APIサーバー: {loading ? <span><Icon.LoadingOutlined />取得中…</span> : (apiServerSemVer == null ? '(エラーが発生しました)' : apiServerSemVer.toString())}</div>
            <QueryResultViewer error={error} loading={false} compact>
                {versionInfo}
            </QueryResultViewer>
        </Layout>
    );
};

export default Index;