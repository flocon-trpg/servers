
import React from 'react';
import MyAuthContext from '../contexts/MyAuthContext';
import { useSelector } from '../store';

export const useMe = () => {
    const myAuth = React.useContext(MyAuthContext);
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    if (typeof myAuth === 'string') {
        return { participant: undefined, userUid: undefined };
    }
    return { participant: participants?.get(myAuth.uid), userUid: myAuth.uid };
};