import React from 'react';
import ClientIdContext from '../contexts/ClientIdContext';

export const useClientId = (): string => {
    const clientId = React.useContext(ClientIdContext);
    if (clientId == null) {
        throw 'clientId not set';
    }
    return clientId;
};