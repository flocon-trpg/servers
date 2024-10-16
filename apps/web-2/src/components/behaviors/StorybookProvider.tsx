import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Client, Provider } from 'urql';
import { RoomGlobalStyle } from '../globalStyles/RoomGlobalStyle';
import { AntdThemeConfigProvider } from './AntdThemeConfigProvider';
import { RoomClientContext, RoomClientContextValue } from '@/contexts/RoomClientContext';

/** Storybookに表示するコンポーネント用のProviderです。Storybookやデバッグ以外で用いることは避けてください。 */
export const StorybookProvider: React.FC<{
    children: React.ReactNode;
    urqlClient?: Client;
    roomClientContextValue: RoomClientContextValue | null;
    compact: boolean;
}> = ({ children, urqlClient, roomClientContextValue, compact }) => {
    const queryClientRef = React.useRef(new QueryClient());
    const childrenWithRoomClient =
        roomClientContextValue == null ? (
            children
        ) : (
            <RoomClientContext.Provider value={roomClientContextValue}>
                {children}
            </RoomClientContext.Provider>
        );

    let result = (
        <QueryClientProvider client={queryClientRef.current}>
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
        result = <Provider value={urqlClient}>{result}</Provider>;
    }

    return result;
};
