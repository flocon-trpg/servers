import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useClient } from 'urql';
import { Props } from '../components/behaviors/AllContextProvider';
import { RoomClientContext } from '@/contexts/RoomClientContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const urqlClient = useClient();
    const reactQueryClient = useQueryClient();
    const roomClient = React.useContext(RoomClientContext);

    return {
        urqlClient,
        reactQueryClient,
        roomClient,
    };
};
