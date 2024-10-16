import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useClient } from 'urql';
import { Props } from '../components/behaviors/AllContextProvider';
import { ClientIdContext } from '../contexts/ClientIdContext';
import { RoomClientContext } from '@/contexts/RoomClientContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const clientId = React.useContext(ClientIdContext);
    const urqlClient = useClient();
    const reactQueryClient = useQueryClient();
    const roomClient = React.useContext(RoomClientContext);

    return {
        clientId,
        urqlClient,
        reactQueryClient,
        roomClient,
    };
};
