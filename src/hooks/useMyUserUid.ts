import React from 'react';
import MyAuthContext from '../contexts/MyAuthContext';

export const useMyUserUid = () => {
    const myAuth = React.useContext(MyAuthContext);
    if (typeof myAuth === 'string') {
        return undefined;
    }
    return myAuth.uid;
};
