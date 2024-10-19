/* eslint-disable react-refresh/only-export-components */
import './styles/css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import { enableMapSet } from 'immer';
import { PropsWithChildren, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { AllContextProvider } from './components/behaviors/AllContextProvider';
import { loggerRef } from '@flocon-trpg/utils';
import React from 'react';
import { firebaseAppAtom, useSetupApp } from './hooks/useSetupApp';
import { AntdThemeConfigProvider } from './components/behaviors/AntdThemeConfigProvider';
import { App as AntdApp, Layout } from 'antd';
import { usePreviousDistinct } from 'react-use';
import { useAtomValue } from 'jotai';

enableMapSet();

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

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

const useLogFirebaseAppMultipleInitialization = () => {
    const app = useAtomValue(firebaseAppAtom);
    const prevApp = usePreviousDistinct(app);

    React.useEffect(() => {
        if (prevApp == null) {
            return;
        }
        loggerRef.warn('Firebase app is initialized multiple times');
    }, [prevApp]);
};

const App = ({ children }: PropsWithChildren) => {
    const { config, authNotFoundState, urqlClient, reactQueryClient, clientId, httpUri, wsUri } =
        useSetupApp();

    useLogFirebaseAppMultipleInitialization();
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
        <AllContextProvider
            clientId={clientId}
            urqlClient={urqlClient}
            reactQueryClient={reactQueryClient}
            roomClient={null}
        >
            {children}
        </AllContextProvider>
    );
};

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <App>
                <RouterProvider router={router} />
            </App>
        </StrictMode>,
    );
}
