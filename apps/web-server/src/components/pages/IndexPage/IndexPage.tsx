import * as Icon from '@ant-design/icons';
import { Link, useNavigate } from '@tanstack/react-router';
import { Alert, Button, Checkbox, Collapse, Typography } from 'antd';
import classNames from 'classnames';
import { useAtom } from 'jotai';
import React from 'react';
import { Layout } from '../../ui/Layout/Layout';
import { SupportedApiServers, VERSION } from '@/VERSION';
import { enableTanStackRouterDevtoolsAtom } from '@/atoms/enableTanStackRouterDevtoolsAtom/enableTanStackRouterDevtoolsAtom';
import { FileSelectorModal } from '@/components/models/file/FileSelectorModal/FileSelectorModal';
import { AwaitableButton } from '@/components/ui/AwaitableButton/AwaitableButton';
import { GraphQLAlert } from '@/components/ui/GraphQLAlert/GraphQLAlert';
import { useGetApiSemVer } from '@/hooks/useGetApiSemVer';
import { flex, flexColumn } from '@/styles/className';
import { apiServerSatisfies } from '@/versioning/apiServerSatisfies';
import { semVerRangeToString } from '@/versioning/semVerRange';

const DeveloperOption: React.FC = () => {
    const [enableTanStackRouterDevtools, setEnableTanStackRouterDevtools] = useAtom(
        enableTanStackRouterDevtoolsAtom,
    );

    return (
        <div className={classNames(flex, flexColumn)}>
            <Checkbox
                value={enableTanStackRouterDevtools}
                onChange={e => {
                    setEnableTanStackRouterDevtools(e.target.checked);
                }}
            >
                {'@tanstack/router-devtools を表示する'}
            </Checkbox>
        </div>
    );
};

export const IndexPage: React.FC = () => {
    const [fileSelectorModalVisible, setFileSelectorModalVisible] = React.useState(false);
    const router = useNavigate();
    const apiServerSemVer = useGetApiSemVer();

    let versionInfo: JSX.Element | null;
    if (apiServerSemVer === null || apiServerSemVer.isError) {
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
        if (apiServerSatisfies({ actual: apiServerSemVer.value, expected: SupportedApiServers })) {
            alert = null;
        } else {
            alert = (
                <Alert
                    type="error"
                    showIcon
                    message="APIサーバーとWebサーバーの間に互換性がありません。APIサーバーとWebサーバーのいずれかもしくは両方をアップデートすることを推奨します。"
                />
            );
        }
        versionInfo = (
            <div className={classNames(flex, flexColumn)}>
                {alert}
                <Collapse
                    ghost
                    items={[
                        {
                            key: '1',
                            label: '詳細',
                            children: (
                                <div className={classNames(flex, flexColumn)}>
                                    <div>{`このWebサーバーが対応しているAPIサーバーのバージョン範囲: ${supportedApiServersAsString}`}</div>
                                    <div>
                                        {
                                            '※ prereleaseの比較は、Node.jsにおけるSemVerとは異なった方法を採用しています。例えば Node.js では "1.0.1-beta.1" は ">1.0.0" の制約を満たしませんが、Flocon では満たしていると判定されます。'
                                        }
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                ></Collapse>
            </div>
        );
    }

    return (
        <Layout>
            <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
                    <AwaitableButton
                        style={{ margin: '0 0 4px 0' }}
                        type="primary"
                        size="large"
                        onClick={() => router({ to: '/rooms' })}
                    >
                        部屋一覧
                    </AwaitableButton>
                    <Button
                        style={{ margin: '0 0 8px 0' }}
                        onClick={() => setFileSelectorModalVisible(true)}
                    >
                        アップローダー
                    </Button>
                    <FileSelectorModal
                        visible={fileSelectorModalVisible}
                        onClose={() => setFileSelectorModalVisible(false)}
                        onSelect={null}
                        defaultFileTypeFilter={null}
                        uploaderFileBrowserHeight={null}
                    />
                </div>
                <Typography.Title level={3}>動作環境</Typography.Title>
                <ul>
                    <li>
                        {
                            'ブラウザはChrome系(Edgeを含む)かFirefoxを推奨します。Internet Explorerではおそらく動作しません。Safariでは、概ね正常に動きますが、メッセージのスクロールでカクつくかもしれません（要調査）。'
                        }
                    </li>
                    <li>
                        {
                            '現時点ではスマートフォンには対応しておりません。動作はしますが、快適にご利用いただけない可能性があります。'
                        }
                    </li>
                    <li>
                        {
                            'AdblockやAdblock Plusを使用していると正常にサイトが動かない不具合が報告されています。もし動作に支障がある場合は、これらの拡張機能を無効にしてからの利用を推奨します。なお、uBlock Originでは不具合は確認されておりません。'
                        }
                    </li>
                </ul>
                <Typography.Title level={3}>バージョン情報</Typography.Title>
                <ul>
                    <li>{`Webサーバー: ${VERSION}`}</li>
                    <li>
                        {'APIサーバー: '}
                        {apiServerSemVer == null ? (
                            <span>
                                <Icon.LoadingOutlined />
                                取得中…
                            </span>
                        ) : apiServerSemVer.isError ? (
                            '(エラーが発生しました)'
                        ) : (
                            apiServerSemVer.value.toString()
                        )}
                        <div style={{ maxWidth: 800 }}>
                            <GraphQLAlert
                                error={
                                    apiServerSemVer?.error == null
                                        ? undefined
                                        : {
                                              mainMessage: 'APIエラー',
                                              error: apiServerSemVer.error,
                                          }
                                }
                                loading={false}
                            >
                                {versionInfo}
                            </GraphQLAlert>
                        </div>
                    </li>
                </ul>
                <Typography.Title level={3}>利用規約・プライバシーポリシー</Typography.Title>
                <ul>
                    <li>
                        <Link to="/tos">利用規約</Link>
                    </li>
                    <li>
                        <Link to="/privacy_policy">プライバシーポリシー</Link>
                    </li>
                </ul>
                <Typography.Title level={3}>外部リンク</Typography.Title>
                <ul>
                    <li>
                        <a href="https://flocon.app" target="_blank" rel="noopener noreferrer">
                            公式サイト
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/flocon-trpg/servers"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ソースコード
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/flocon-trpg/servers/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            更新履歴
                        </a>
                    </li>
                </ul>
                <Typography.Title level={3}>その他</Typography.Title>
                <ul>
                    <li>
                        <Link to="/licenses">使用している素材とライブラリのライセンス</Link>
                    </li>
                </ul>
                <Typography.Title level={3}>開発者向けオプション</Typography.Title>
                <Collapse
                    ghost
                    items={[{ key: '1', label: 'クリックで表示', children: <DeveloperOption /> }]}
                />
            </div>
        </Layout>
    );
};
