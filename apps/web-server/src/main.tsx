/* eslint-disable react-refresh/only-export-components */
import './styles/css/main.scss';

import 'firebase/auth';
import 'firebase/storage';

import { loggerRef } from '@flocon-trpg/utils';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { App as AntdApp } from 'antd';
import { enableMapSet } from 'immer';
import React, { PropsWithChildren, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AllContextProvider } from './components/behaviors/AllContextProvider';
import { AntdThemeConfigProvider } from './components/behaviors/AntdThemeConfigProvider';
import { EnvsMonitor } from './components/models/envs/EnvsMonitor/EnvsMonitor';
import { AlertCounter, AlertCounterContext } from './components/ui/AlertCounter/AlertCounter';
import { LayoutWithNoHook } from './components/ui/Layout/Layout';
import { SuspenseWithFallback } from './components/ui/SuspenseWithFallback/SuspenseWithFallback';
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

const alertCounterSymbol = Symbol();

const App = ({ children }: PropsWithChildren) => {
    const { authNotFoundState, urqlClient, reactQueryClient, clientId, httpUri, wsUri } =
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

    if (authNotFoundState) {
        return (
            <ThemedDiv style={{ padding: 12 }}>
                {
                    'エラーが発生しました。環境変数をセットし忘れている可能性があります。 - authNotFound / An unexpected error occured: authNotFound'
                }
                <h3>環境変数</h3>
                <p>{'この Web サーバーに設定されている環境変数は次のとおりです。'}</p>
                <AlertCounterContext.Provider value={alertCounterSymbol}>
                    <AlertCounter.Counter />
                    <EnvsMonitor />
                </AlertCounterContext.Provider>
            </ThemedDiv>
        );
    }
    return (
        <AllContextProvider
            urqlClient={urqlClient}
            reactQueryClient={reactQueryClient}
            roomClient={null}
        >
            <SuspenseWithFallback
                modifyFallback={element => <ThemedDiv style={{ padding: 5 }}>{element}</ThemedDiv>}
            >
                {children}
            </SuspenseWithFallback>
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
