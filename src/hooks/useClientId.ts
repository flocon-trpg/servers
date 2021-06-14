import React from 'react';
import ClientIdContext from '../contexts/ClientIdContext';

export const useClientId = (): string => {
    const clientId = React.useContext(ClientIdContext);
    if (clientId == null) {
        throw new Error('clientId not set');
    }
    return clientId;
};