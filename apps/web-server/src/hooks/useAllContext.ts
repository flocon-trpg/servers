import { useClient } from 'urql';
import React from 'react';
import { Props } from '../components/behaviors/AllContextProvider';
import { ClientIdContext } from '../contexts/ClientIdContext';
import { useQueryClient } from 'react-query';

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
