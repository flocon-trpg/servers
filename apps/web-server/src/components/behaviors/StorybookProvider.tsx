import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    AnyRouter,
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from '@tanstack/react-router';
import { App } from 'antd';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Client, Provider } from 'urql';
import { RoomGlobalStyle } from '../globalStyles/RoomGlobalStyle';
import { AntdThemeConfigProvider } from './AntdThemeConfigProvider';
import { RoomClientContext, RoomClientContextValue } from '@/contexts/RoomClientContext';

const useFakeRouter = () => {
    return React.useMemo(() => {
        const rootRoute = createRootRoute();
        const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' });
        const memoryHistory = createMemoryHistory({ initialEntries: ['/'] });
        const routeTree = rootRoute.addChildren([indexRoute]);
        const router = createRouter({ routeTree, history: memoryHistory });
        return router;
    }, []);
};

/** Storybookに表示するコンポーネント用のProviderです。Storybookやデバッグ以外で用いることは避けてください。 */
export const StorybookProvider: React.FC<{
    children: React.ReactNode;
    urqlClient?: Client;
    roomClientContextValue: RoomClientContextValue | null;
    compact: boolean;
}> = ({ children, urqlClient, roomClientContextValue, compact }) => {
    const fakeRouter = useFakeRouter();
    const queryClient = React.useMemo(() => new QueryClient(), []);
    const childrenWithRoomClient =
        roomClientContextValue == null ? (
            children
        ) : (
            <RoomClientContext.Provider value={roomClientContextValue}>
                {children}
            </RoomClientContext.Provider>
        );

    let defaultComponent = (
        <QueryClientProvider client={queryClient}>
            <DndProvider backend={HTML5Backend}>
                <AntdThemeConfigProvider compact={compact}>
                    <App>
                        <RoomGlobalStyle />
                        {childrenWithRoomClient}
                    </App>
                </AntdThemeConfigProvider>
            </DndProvider>
        </QueryClientProvider>
    );
    if (urqlClient != null) {
        defaultComponent = <Provider value={urqlClient}>{defaultComponent}</Provider>;
    }
    return (
        // RouterProvider を使わないと useNavigate() や <Link/> があるコンポーネントで失敗する
        // https://github.com/TanStack/router/discussions/952#discussioncomment-8714622 を参考にして作成
        <RouterProvider<AnyRouter>
            router={fakeRouter}
            defaultComponent={() => defaultComponent}
        ></RouterProvider>
    );
};
