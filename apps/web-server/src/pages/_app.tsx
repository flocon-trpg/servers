import '../styles/css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import { loggerRef } from '@flocon-trpg/utils';
import { App as AntdApp, Layout } from 'antd';
import { enableMapSet } from 'immer';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { PropsWithChildren } from 'react';
import { AllContextProvider } from '../components/behaviors/AllContextProvider';
import { AntdThemeConfigProvider } from '@/components/behaviors/AntdThemeConfigProvider';
import { useSetupApp } from '@/hooks/useSetupApp';

enableMapSet();

const ThemedDiv: React.FC<PropsWithChildren<{ style?: React.CSSProperties }>> = ({
    children,
    style,
}) => {
    return (
        <AntdThemeConfigProvider compact={false}>
            <AntdApp>
                <Layout style={{ minHeight: '100vh' }}>
                    <Layout.Content>
                        <div style={style}>{children}</div>
                    </Layout.Content>
                </Layout>
            </AntdApp>
        </AntdThemeConfigProvider>
    );
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const { config, authNotFoundState, urqlClient, reactQueryClient, clientId, httpUri, wsUri } =
        useSetupApp();

    React.useEffect(() => {
        if (httpUri == null) {
            return;
        }
        loggerRef.info(`GraphQL HTTP URL: ${httpUri}`);
    }, [httpUri]);
    React.useEffect(() => {
        if (wsUri == null) {
            return;
        }
        loggerRef.info(`GraphQL WebSocket URL: ${wsUri}`);
    }, [wsUri]);
    React.useEffect(() => {
        loggerRef.info(`clientId: ${clientId}`);
    }, [clientId]);

    if (config == null) {
        return <ThemedDiv style={{ padding: 5 }}>{'env.txt を確認しています…'}</ThemedDiv>;
    }

    if (config.isError) {
        return (
            <ThemedDiv
                style={{ padding: 5 }}
            >{`設定ファイルに問題があります: ${config.error}`}</ThemedDiv>
        );
    }

    if (authNotFoundState) {
        return (
            <ThemedDiv style={{ padding: 5 }}>
                {
                    '予期しないエラーが発生しました: authNotFound / An unexpected error occured: authNotFound'
                }
            </ThemedDiv>
        );
    }
    if (urqlClient == null || reactQueryClient == null) {
        return (
            <ThemedDiv style={{ padding: 5 }}>{'しばらくお待ち下さい… / Please wait…'}</ThemedDiv>
        );
    }
    return (
        <>
            <Head>
                <link rel='shortcut icon' href='/assets/logo.png' />
            </Head>
            <AllContextProvider
                clientId={clientId}
                urqlClient={urqlClient}
                reactQueryClient={reactQueryClient}
                roomClient={null}
            >
                <Component {...pageProps} />
            </AllContextProvider>
        </>
    );
};

export default App;
