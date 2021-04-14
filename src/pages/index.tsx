import { Alert, Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useDispatch } from 'react-redux';
import { alpha, apiServerRequiresUpdate, beta, differentPrereleaseVersion, rc, SemVer, webServerRequiresUpdate } from '../@shared/semver';
import FilesManagerDrawer from '../components/FilesManagerDrawer';
import QueryResultViewer from '../foundations/QueryResultViewer';
import LoadingResult from '../foundations/Result/LoadingResult';
import { PrereleaseType, useCreateRoomMutation, useGetServerInfoQuery } from '../generated/graphql';
import Layout from '../layouts/Layout';
import { FilesManagerDrawerType, none } from '../utils/types';
import VERSION from '../VERSION';

const Index: React.FC = () => {
    const [drawerType, setDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    const { data: serverInfo, loading, error } = useGetServerInfoQuery();

    const versionInfo = (() => {
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
        const apiServerSemVer = new SemVer({
            ...serverInfo.result.version,
            prerelease,
        });

        const checkResult = SemVer.check({ api: apiServerSemVer, web: VERSION });

        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>{`APIサーバー: ${apiServerSemVer.toString()}`}</div>
            <div>{`WEBサーバー: ${VERSION.toString()}`}</div>
            {checkResult === apiServerRequiresUpdate && <Alert type='error' showIcon message='APIサーバーのバージョンがWEBサーバーのバージョンと比べて古いため、正常に動作しない可能性があります。' />}
            {checkResult === webServerRequiresUpdate && <Alert type='error' showIcon message='WEBサーバーのバージョンがAPIサーバーのバージョンと比べて古いため、正常に動作しない可能性があります。' />}
            {checkResult === differentPrereleaseVersion && <Alert type='warning' showIcon message='APIサーバーとWEBサーバーのうち少なくとも一方がalpha版ですが、バージョンが完全に一致していないため、互換性は保証されません。' />}
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
            <QueryResultViewer error={error} loading={loading} compact>
                {versionInfo}
            </QueryResultViewer>
        </Layout>
    );
};

export default Index;