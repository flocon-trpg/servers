import { FirebaseConfig, env } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { Link } from '@tanstack/react-router';
import { Alert, Card, Divider, Popover } from 'antd';
import { useAtomValue } from 'jotai';
import React, { PropsWithChildren } from 'react';
import { EnvsMonitorAtomReturnType, envsMonitorAtom } from '@/atoms/webConfigAtom/webConfigAtom';
import { HelpMessageTooltip } from '@/components/ui/HelpMessageTooltip/HelpMessageTooltip';

const ValueView: React.FC<PropsWithChildren<{ code?: boolean }>> = ({ children, code }) => {
    // TODO: ダークモード以外にも対応するときは、背景色を変える
    return (
        <span style={{ backgroundColor: code === true ? 'rgba(200,200,200,0.2)' : undefined }}>
            {children}
        </span>
    );
};

const ErrorValueView: React.FC<{ message: string }> = ({ message }) => {
    return <Alert message={`エラー: ${message}`} type="error" showIcon />;
};

const SourceValueView: React.FC<{ value: string | undefined }> = ({ value }) => {
    if (value == null) {
        return <ValueView>{'(値なし)'}</ValueView>;
    }
    return <ValueView code>{value}</ValueView>;
};

const ParsedValueView: React.FC<{
    value:
        | string
        | undefined
        | string[]
        | boolean
        | Result<string | undefined | string[] | boolean>;
}> = ({ value }) => {
    if (value === undefined) {
        return <ValueView>{'(値なし)'}</ValueView>;
    }
    if (Array.isArray(value)) {
        return (
            <ul>
                {value.map((v, i) => (
                    <li key={i}>
                        <ValueView code>{v}</ValueView>
                    </li>
                ))}
            </ul>
        );
    }
    if (value === true || value === false) {
        return <ValueView code>{value ? 'true' : 'false'}</ValueView>;
    }
    if (typeof value === 'string') {
        if (value.trim() === '') {
            return <ValueView>{'(値が空です)'}</ValueView>;
        }
        return <ValueView code>{value}</ValueView>;
    }
    if (value.isError) {
        return <ErrorValueView message={value.error} />;
    }
    return <ParsedValueView value={value.value} />;
};

const ParsedFirebaseConfigValueView: React.FC<{ value: Result<FirebaseConfig> | undefined }> = ({
    value,
}) => {
    if (value == null) {
        return <ValueView>{'(値なし)'}</ValueView>;
    }
    if (value.isError) {
        return <ErrorValueView message={value.error} />;
    }
    return (
        <ul>
            <li>
                {'appId: '}
                <ValueView code>{value.value.appId}</ValueView>
            </li>
            <li>
                {'appKey: '}
                <ValueView code>{value.value.apiKey}</ValueView>
            </li>
            <li>
                {'authDomain: '}
                <ValueView code>{value.value.authDomain}</ValueView>
            </li>
            <li>
                {'messagingSenderId: '}
                <ValueView code>{value.value.messagingSenderId}</ValueView>
            </li>
            <li>
                {'projectId: '}
                <ValueView code>{value.value.projectId}</ValueView>
            </li>
            <li>
                {'storageBucket: '}
                <ValueView code>{value.value.storageBucket}</ValueView>
            </li>
        </ul>
    );
};

type EnvsMonitorContentProps = {
    envsMonitor: EnvsMonitorAtomReturnType;
    style?: React.CSSProperties;
};

const EnvsMonitorCardContent: React.FC<EnvsMonitorContentProps> = ({ envsMonitor }) => {
    const envTxtHeader = (
        <h4>
            <Link to="/text/env">{'env.txt'}</Link> の値
        </h4>
    );
    const importMetaEnvHeader = (
        <h4>
            <HelpMessageTooltip
                overlayWidth={500}
                title={
                    <div>
                        Vite の <code>import.meta.env</code>{' '}
                        から取得された値です。これは一般的に次の値となります。
                        <ul>
                            <li>
                                環境変数が設定可能なホスティングサービスに Web
                                サーバーをデプロイしている場合:
                                ホスティングサービス側で設定した環境変数
                            </li>
                            <li>
                                Web サーバーを自分でビルドした場合: ビルド時に OS
                                で設定されていた環境変数もしくは .env 系のファイルから読み込まれた値
                            </li>
                            <li>
                                (開発者向け) <code>yarn run dev</code> で動かしている場合: OS
                                で設定されている環境変数もしくは .env 系のファイルから読み込まれた値
                            </li>
                        </ul>
                        Web サーバーのビルド時に <code>import.meta.env</code> の値が JavaScript
                        に埋め込まれています。OS の環境変数が全て埋め込まれるわけではありません。
                    </div>
                }
            >
                Vite の import.meta.env の値
            </HelpMessageTooltip>
        </h4>
    );

    const sourceTitle = '元の値: ';
    const parsedTitle = 'パース後の値: ';
    const sourceAndParsedTitle = '元の値&パース後の値: ';
    const detailText = '詳細';
    const detailLinkStyle: React.CSSProperties = { marginLeft: 4 };
    const detailPopoverOverlayInnerStyle: React.CSSProperties = { width: 500 };
    const envTxtNotFound = (
        <div>
            <div>
                {
                    'env.txt を取得できませんでした。env.txt が存在しないか、アクセスできない状態になっているか、オフラインだった可能性があります。env.txt が正常に取得できる状態の場合は、ブラウザの更新で直ることがあります。'
                }
            </div>
            <div>
                {
                    'サーバー運用者へ: env.txt を使わない場合は env.txt が存在しなくても正常に動きます。'
                }
            </div>
        </div>
    );

    const firebaseConfigPopoverContent = (
        <div>
            {envTxtHeader}
            {envsMonitor.publicEnvTxtFetched ? (
                <div>
                    <div>
                        {sourceTitle}
                        <SourceValueView
                            value={envsMonitor.value.firebaseConfig.publicEnvTxt.source}
                        />
                    </div>
                    <div>
                        {parsedTitle}
                        <ParsedFirebaseConfigValueView
                            value={envsMonitor.value.firebaseConfig.publicEnvTxt.parsed}
                        />
                    </div>
                </div>
            ) : (
                envTxtNotFound
            )}
            {importMetaEnvHeader}
            <div>
                {sourceTitle}
                <SourceValueView value={envsMonitor.value.firebaseConfig.importMetaEnv.source} />
            </div>
            <div>
                {parsedTitle}
                <ParsedFirebaseConfigValueView
                    value={envsMonitor.value.firebaseConfig.importMetaEnv.parsed}
                />
            </div>
        </div>
    );

    const httpPopoverContent = (
        <div>
            {envTxtHeader}
            {envsMonitor.publicEnvTxtFetched ? (
                <div>
                    <div>
                        {sourceAndParsedTitle}
                        <ParsedValueView value={envsMonitor.value.http.publicEnvTxt} />
                    </div>
                </div>
            ) : (
                envTxtNotFound
            )}
            {importMetaEnvHeader}
            <div>
                {sourceAndParsedTitle}
                <ParsedValueView value={envsMonitor.value.http.importMetaEnv} />
            </div>
        </div>
    );

    const wsPopoverContent = (
        <div>
            {envTxtHeader}
            {envsMonitor.publicEnvTxtFetched ? (
                <div>
                    <div>
                        {sourceAndParsedTitle}
                        <ParsedValueView value={envsMonitor.value.ws.publicEnvTxt} />
                    </div>
                </div>
            ) : (
                envTxtNotFound
            )}
            {importMetaEnvHeader}
            <div>
                {sourceAndParsedTitle}
                <ParsedValueView value={envsMonitor.value.ws.importMetaEnv} />
            </div>
        </div>
    );

    const authProvidersPopoverContent = (
        <div>
            {envTxtHeader}
            {envsMonitor.publicEnvTxtFetched ? (
                <div>
                    <div>
                        {sourceTitle}
                        <SourceValueView
                            value={envsMonitor.value.authProviders.publicEnvTxt.source}
                        />
                    </div>
                    <div>
                        {parsedTitle}
                        <ParsedValueView
                            value={envsMonitor.value.authProviders.publicEnvTxt.parsed}
                        />
                    </div>
                </div>
            ) : (
                envTxtNotFound
            )}
            {importMetaEnvHeader}
            <div>
                {sourceTitle}
                <SourceValueView value={envsMonitor.value.authProviders.importMetaEnv.source} />
            </div>
            <div>
                {parsedTitle}
                <ParsedValueView value={envsMonitor.value.authProviders.importMetaEnv.parsed} />
            </div>
        </div>
    );

    const unlistedFirebaseStorageEnabledPopoverContent = (
        <div>
            {envTxtHeader}
            {envsMonitor.publicEnvTxtFetched ? (
                <div>
                    <div>
                        {sourceTitle}
                        <SourceValueView
                            value={
                                envsMonitor.value.isUnlistedFirebaseStorageEnabled.publicEnvTxt
                                    .source
                            }
                        />
                    </div>
                    <div>
                        {parsedTitle}
                        <ParsedValueView
                            value={
                                envsMonitor.value.isUnlistedFirebaseStorageEnabled.publicEnvTxt
                                    .parsed
                            }
                        />
                    </div>
                </div>
            ) : (
                envTxtNotFound
            )}
            {importMetaEnvHeader}
            <div>
                {sourceTitle}
                <SourceValueView
                    value={envsMonitor.value.isUnlistedFirebaseStorageEnabled.importMetaEnv.source}
                />
            </div>
            <div>
                {parsedTitle}
                <ParsedValueView
                    value={envsMonitor.value.isUnlistedFirebaseStorageEnabled.importMetaEnv.parsed}
                />
            </div>
        </div>
    );

    const logLevelPopoverContent = (
        <div>
            {envTxtHeader}
            {envsMonitor.publicEnvTxtFetched ? (
                <div>
                    <div>
                        {sourceTitle}
                        <SourceValueView value={envsMonitor.value.logLevel.publicEnvTxt.source} />
                    </div>
                    <div>
                        {parsedTitle}
                        <ParsedValueView value={envsMonitor.value.logLevel.publicEnvTxt.parsed} />
                    </div>
                </div>
            ) : (
                envTxtNotFound
            )}
            {importMetaEnvHeader}
            <div>
                {sourceTitle}
                <SourceValueView value={envsMonitor.value.logLevel.importMetaEnv.source} />
            </div>
            <div>
                {parsedTitle}
                <ParsedValueView value={envsMonitor.value.logLevel.importMetaEnv.parsed} />
            </div>
        </div>
    );

    return (
        <div>
            <h4>{env.NEXT_PUBLIC_FIREBASE_CONFIG}</h4>
            <p>
                <ParsedFirebaseConfigValueView
                    value={
                        envsMonitor.value.firebaseConfig.final == null
                            ? undefined
                            : Result.ok(envsMonitor.value.firebaseConfig.final)
                    }
                />
                <Popover trigger="click" content={firebaseConfigPopoverContent}>
                    <a style={detailLinkStyle}>{detailText}</a>
                </Popover>
            </p>
            {envsMonitor.value.firebaseConfig.final == null && (
                <Alert
                    message={`Flocon の Web サーバーを動かすには ${env.NEXT_PUBLIC_FIREBASE_CONFIG} で Firebase の設定が必要です。`}
                    type="error"
                    showIcon
                />
            )}
            <Divider />
            <h4>{env.NEXT_PUBLIC_API_HTTP}</h4>
            <p>
                <ParsedValueView value={envsMonitor.value.http.final} />
                <Popover trigger="click" content={httpPopoverContent}>
                    <a style={detailLinkStyle}>{detailText}</a>
                </Popover>
            </p>
            {envsMonitor.value.http.final == null && (
                <Alert
                    message={`Flocon の Web サーバーを動かすには通常は ${env.NEXT_PUBLIC_API_HTTP} で  API サーバーの URL を HTTPS もしくは HTTP で設定する必要があります。`}
                    type="warning"
                    showIcon
                />
            )}
            <Divider />
            <h4>{env.NEXT_PUBLIC_API_WS}</h4>
            <p>
                <ParsedValueView value={envsMonitor.value.ws.final} />
                <Popover trigger="click" content={wsPopoverContent}>
                    <a style={detailLinkStyle}>{detailText}</a>
                </Popover>
            </p>
            {envsMonitor.value.ws.final == null && (
                <Alert
                    message={`Flocon の Web サーバーを動かすには通常は ${env.NEXT_PUBLIC_API_WS} で API サーバーの WebSocket の URL を設定する必要があります。URL は通常、wss:// か ws:// で始まります。`}
                    type="warning"
                    showIcon
                />
            )}
            <Divider />
            <h4>{env.NEXT_PUBLIC_AUTH_PROVIDERS}</h4>
            <p>
                <ParsedValueView value={envsMonitor.value.authProviders.final} />
                <Popover
                    overlayInnerStyle={detailPopoverOverlayInnerStyle}
                    trigger="click"
                    content={authProvidersPopoverContent}
                >
                    <a style={detailLinkStyle}>{detailText}</a>
                </Popover>
            </p>
            <Divider />
            <h4>{env.NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED}</h4>
            <p>
                <ParsedValueView value={envsMonitor.value.isUnlistedFirebaseStorageEnabled.final} />
                <Popover trigger="click" content={unlistedFirebaseStorageEnabledPopoverContent}>
                    <a style={detailLinkStyle}>{detailText}</a>
                </Popover>
            </p>
            <Divider />
            <h4>{env.NEXT_PUBLIC_LOG_LEVEL}</h4>
            <p>
                <ParsedValueView value={envsMonitor.value.logLevel.final} />
                <Popover trigger="click" content={logLevelPopoverContent}>
                    <a style={detailLinkStyle}>{detailText}</a>
                </Popover>
            </p>
        </div>
    );
};

// Storybook で用いるためだけに export している
export const EnvsMonitorContent: React.FC<EnvsMonitorContentProps> = ({ envsMonitor, style }) => {
    return (
        <Card
            style={style}
            title={
                <HelpMessageTooltip
                    overlayWidth={400}
                    title={
                        'この Web サーバーに適用されている環境変数の一覧です。この Web サーバーの運用者向けの UI であり、運用者以外が利用する機会は少ないと思われます。API サーバーの環境変数は Web サーバーから直接取得することはできないためこの一覧には含まれません。'
                    }
                >
                    {'環境変数'}
                </HelpMessageTooltip>
            }
        >
            <EnvsMonitorCardContent envsMonitor={envsMonitor} />
        </Card>
    );
};

type Props = Omit<EnvsMonitorContentProps, 'envsMonitor'>;

export const EnvsMonitor: React.FC<Props> = ({ style }) => {
    const envsMonitor = useAtomValue(envsMonitorAtom);
    return <EnvsMonitorContent style={style} envsMonitor={envsMonitor} />;
};
