import { Alert, Button, Collapse, Typography } from 'antd';
import React from 'react';
import { FilesManagerDrawer } from '../contextual/room/file/FilesManagerDrawer';
import { QueryResultViewer } from '../ui/QueryResultViewer';
import { GetServerInfoDocument, PrereleaseType } from '@flocon-trpg/typed-document-node';
import { Layout } from '../ui/Layout';
import { FilesManagerDrawerType, none } from '../../utils/types';
import { SupportedApiServers, VERSION } from '../../VERSION';
import * as Icon from '@ant-design/icons';
import { alpha, beta, rc, SemVer } from '@flocon-trpg/utils';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { flex, flexColumn } from '../../utils/className';
import { useQuery } from '@apollo/client';
import { apiServerSatisfies } from '../../versioning/apiServerSatisfies';
import { semVerRangeToString } from '../../versioning/semVerRange';

export const Index: React.FC = () => {
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
                    message='APIサーバーとWebサーバーの間に互換性がありません。APIサーバーとWebサーバーのいずれかもしくは両方をアップデートすることを推奨します。'
                />
            );
        }
        versionInfo = (
            <div className={classNames(flex, flexColumn)}>
                {alert}
                <Collapse ghost>
                    <Collapse.Panel header='詳細' key='version-info-detais-panel'>
                        <div className={classNames(flex, flexColumn)}>
                            <div>{`このWebサーバーが対応しているAPIサーバーのバージョン範囲: ${supportedApiServersAsString}`}</div>
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
                        アップローダー
                    </Button>
                    <FilesManagerDrawer
                        drawerType={drawerType}
                        onClose={() => setDrawerType(null)}
                    />
                </div>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>動作環境</Typography.Title>
                <ul>
                    <li>
                        ブラウザはChrome系(Edgeを含む)かFirefoxを推奨します。Internet
                        Explorerではおそらく動作しません。Safariでは、概ね正常に動きますが、メッセージのスクロールでカクつくかもしれません（要調査）。
                    </li>
                    <li>現時点ではスマートフォンには対応しておりません。</li>
                    <li>
                        AdblockやAdblock
                        Plusを使用していると正常にサイトが動かない不具合が報告されています。もし動作に支障がある場合は、これらの拡張機能を無効にしてからの利用を推奨します。なお、uBlock
                        Originでは不具合は確認されておりません。
                    </li>
                </ul>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>バージョン情報</Typography.Title>
                <ul>
                    <li>{`Webサーバー: ${VERSION}`}</li>
                    <li>
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
                        <div style={{ maxWidth: 800 }}>
                            <QueryResultViewer error={error} loading={false} compact>
                                {versionInfo}
                            </QueryResultViewer>
                        </div>
                    </li>
                </ul>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>利用規約・プライバシーポリシー</Typography.Title>
                <ul>
                    <li>
                        <a href='/tos'>利用規約</a>
                    </li>
                    <li>
                        <a href='/privacy_policy'>プライバシーポリシー</a>
                    </li>
                </ul>
                <div style={{ height: spacing }} />
                <Typography.Title level={3}>外部リンク</Typography.Title>
                <ul>
                    <li>
                        <a href='https://flocon.app' target='_blank' rel='noopener noreferrer'>
                            公式サイト
                        </a>
                    </li>
                    <li>
                        <a
                            href='https://github.com/flocon-trpg/servers/releases'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            更新履歴
                        </a>
                    </li>
                </ul>
            </div>
        </Layout>
    );
};
