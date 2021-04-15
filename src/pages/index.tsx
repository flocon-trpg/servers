import { Alert, Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { alpha, apiServerRequiresUpdate, beta, rc, SemVer, webServerRequiresUpdate } from '../@shared/semver';
import FilesManagerDrawer from '../components/FilesManagerDrawer';
import QueryResultViewer from '../foundations/QueryResultViewer';
import LoadingResult from '../foundations/Result/LoadingResult';
import { PrereleaseType, useCreateRoomMutation, useGetServerInfoQuery } from '../generated/graphql';
import Layout from '../layouts/Layout';
import { FilesManagerDrawerType, none } from '../utils/types';
import VERSION from '../VERSION';
import * as Icon from '@ant-design/icons';

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
            {checkResult === apiServerRequiresUpdate && <Alert type='error' showIcon message='APIサーバーのバージョンがWEBサーバーのバージョンと比べて古いため、正常に動作しない可能性があります。' />}
            {checkResult === webServerRequiresUpdate && <Alert type='error' showIcon message='WEBサーバーのバージョンがAPIサーバーのバージョンと比べて古いため、正常に動作しない可能性があります。' />}
            {checkResult === alpha && <Alert type='warning' showIcon message='APIサーバーとWEBサーバーのうち少なくとも一方がalpha版であるため、互換性は保証されません。' />}
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