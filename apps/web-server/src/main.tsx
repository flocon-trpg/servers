/* eslint-disable react-refresh/only-export-components */
import './styles/css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import { loggerRef } from '@flocon-trpg/utils';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { App as AntdApp, Layout } from 'antd';
import { enableMapSet } from 'immer';
import React, { PropsWithChildren, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AllContextProvider } from './components/behaviors/AllContextProvider';
import { AntdThemeConfigProvider } from './components/behaviors/AntdThemeConfigProvider';
import { LayoutWithNoHook } from './components/ui/Layout/Layout';
import { useOnFirebaseAppChange, useSetupApp } from './hooks/useSetupApp';
import { routeTree } from './routeTree.gen';

enableMapSet();

const ThemedDiv: React.FC<PropsWithChildren<{ style?: React.CSSProperties }>> = ({
    children,
    style,
}) => {
    return (
        <AntdThemeConfigProvider compact={false}>
            <AntdApp>
                <LayoutWithNoHook>
                    <div style={style}>{children}</div>
                </LayoutWithNoHook>
            </AntdApp>
        </AntdThemeConfigProvider>
    );
};

// Create a new router instance
const router = createRouter({
    routeTree,
    notFoundMode: 'root',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const App = ({ children }: PropsWithChildren) => {
    const { config, authNotFoundState, urqlClient, reactQueryClient, clientId, httpUri, wsUri } =
        useSetupApp();

    useOnFirebaseAppChange(() => {
        loggerRef.warn('Firebase app is initialized multiple times');
    });
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
