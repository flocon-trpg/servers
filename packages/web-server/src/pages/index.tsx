import { Alert, Button, Collapse, Typography } from 'antd';
import Link from 'next/link';
import React from 'react';
import { FilesManagerDrawer } from '../components/FilesManagerDrawer';
import { QueryResultViewer } from '../components/QueryResultViewer';
import { GetServerInfoDocument, PrereleaseType } from '@flocon-trpg/typed-document-node';
import { Layout } from '../layouts/Layout';
import { FilesManagerDrawerType, none } from '../utils/types';
import { SupportedApiServers, VERSION } from '../VERSION';
import * as Icon from '@ant-design/icons';
import { alpha, beta, rc, SemVer } from '@flocon-trpg/utils';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { flex, flexColumn } from '../utils/className';
import { useQuery } from '@apollo/client';
import { apiServerSatisfies } from '../versioning/apiServerSatisfies';
import { semVerRangeToString } from '../versioning/semVerRange';

const Index: React.FC = () => {
    const [drawerType, setDrawerType] = React.useState<FilesManagerDrawerType | null>(null);
    const router = useRouter();

    const { data: serverInfo, loading, error } = useQuery(GetServerInfoDocument);

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

    let versionInfo: JSX.Element | null;
    if (apiServerSemVer == null) {
        versionInfo = null;
    } else {
        const supportedApiServersAsString =
            SupportedApiServers.reduce((seed, elem, i) => {
                // Node.jsとはpreleaseの比較方法が異なるため、"^x.y.z" という（おそらく）Node.js特有の表記方法は混乱を招くと思い使っていない。

                if (i === 0) {
                    return `${seed}"${semVerRangeToString(elem)}"`;
                }
                return `${seed}, "${semVerRangeToString(elem)}"`;
            }, '[ ') + ' ]';
        let alert: JSX.Element | null;
        if (apiServerSatisfies({ actual: apiServerSemVer, expected: SupportedApiServers })) {
            alert = null;
        } else {
            alert = (
                <Alert
                    type='error'
                    showIcon
                    message='クライアントとAPIサーバーの間に互換性がありません。APIサーバーとWebサーバーのいずれかもしくは両方をアップデートすることを推奨します。'
                />
            );
        }
        versionInfo = (
            <div className={classNames(flex, flexColumn)}>
                {alert}
                <Collapse ghost>
                    <Collapse.Panel header='詳細' key='version-info-detais-panel'>
                        <div className={classNames(flex, flexColumn)}>
                            <div>{`supported API server versions: ${supportedApiServersAsString}`}</div>
                            <div>
                                ※
                                prereleaseの比較は、Node.jsにおけるSemVerとは異なった方法を採用しています
                            </div>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </div>
        );
    }

    const spacing = 24;
    return (
        <Layout>
            <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
                    <Button
                        style={{ margin: '0 0 4px 0' }}
                        type='primary'
                        size='large'
                        onClick={() => router.push('/rooms')}
                    >
                        部屋一覧
                    </Button>
                    <Button
                        style={{ margin: '0 0 8px 0' }}
                        onClick={() => setDrawerType({ openFileType: none })}
                    >
                        ファイルマネージャー
                    </Button>
                    <FilesManagerDrawer
                        drawerType={drawerType}
                        onClose={() => setDrawerType(null)}
                    />
                </div>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>バグと対処法</Typography.Title>
                <ul>
                    <li>
                        ブラウザはChrome系(Edgeを含む)かFirefoxを推奨します。Internet
                        Explorerではおそらく動作しません。Safariでは、概ね正常に動きますが、メッセージのスクロールでカクつくかもしれません（要調査）。
                    </li>
                    <li>
                        AdblockやAdblock
                        Plusを使用していると正常にサイトが動かないという不具合が報告されています。これらの拡張機能を無効にしてからの利用を推奨します。
                    </li>
                </ul>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>バージョン情報</Typography.Title>
                <div>{`クライアント: ${VERSION}`}</div>
                <div>
                    APIサーバー:{' '}
                    {loading ? (
                        <span>
                            <Icon.LoadingOutlined />
                            取得中…
                        </span>
                    ) : apiServerSemVer == null ? (
                        '(エラーが発生しました)'
                    ) : (
                        apiServerSemVer.toString()
                    )}
                </div>
                <QueryResultViewer error={error} loading={false} compact>
                    {versionInfo}
                </QueryResultViewer>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>解説サイト（仮）を作成しました</Typography.Title>
                <div>
                    将来の正式公開を見据えて、試験的に
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://flocon-docusaurus.vercel.app/'
                    >
                        解説サイト（仮）
                    </a>
                    を作りました。新しい解説は今後解説サイトのほうに書いていこうと思います。下の記事も解説サイトに移行するかもしれません。
                </div>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>ドキュメント、コラムなど</Typography.Title>
                <ul>
                    <li>
                        <Link href='/docs/auth'>Floconにおけるユーザー認証の仕組み</Link> (
                        2021/06/09)
                    </li>
                    <li>
                        <Link href='/docs/storage'>ファイルアップローダーの仕様</Link> ( 2021/06/09)
                    </li>
                    <li>
                        <Link href='/docs/board'>新しくなったボードの使い方</Link> (2021/05/29)
                    </li>
                </ul>
            </div>
        </Layout>
    );
};

export default Index;
