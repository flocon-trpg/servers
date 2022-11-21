import React from 'react';
import { useQueryClient } from 'react-query';
import { useClient } from 'urql';
import { Props } from '../components/behaviors/AllContextProvider';
import { ClientIdContext } from '../contexts/ClientIdContext';

// AllContextProviderと合わせて使うためのhook
export const useAllContext = (): Props => {
    const clientId = React.useContext(ClientIdContext);
    const urqlClient = useClient();
    const reactQueryClient = useQueryClient();

    return {
        clientId,
        urqlClient,
        reactQueryClient,
    };
};
