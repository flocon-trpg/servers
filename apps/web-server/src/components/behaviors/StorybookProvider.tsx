import { Client, Provider } from 'urql';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryClient, QueryClientProvider } from 'react-query';

export const StorybookProvider: React.FC<{ children: React.ReactNode; urqlClient?: Client }> = ({
    children,
    urqlClient,
}) => {
    const queryClientRef = React.useRef(new QueryClient());

    let result = (
        <QueryClientProvider client={queryClientRef.current}>
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </QueryClientProvider>
    );
    if (urqlClient != null) {
        result = <Provider value={urqlClient}>{result}</Provider>;
    }

    return result;
};
