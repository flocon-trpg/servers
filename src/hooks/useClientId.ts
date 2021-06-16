import React from 'react';
import ClientIdContext from '../contexts/ClientIdContext';

// 同じユーザーが複数のブラウザを開いたときでも区別させたい（どれかがoperateしたときに他のブラウザに変更を伝える必要がある）ため、このhooksを用いて区別している。
export const useClientId = (): string => {
    const clientId = React.useContext(ClientIdContext);
    if (clientId == null) {
        throw new Error('clientId not set');
    }
    return clientId;
};