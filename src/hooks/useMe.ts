
import React from 'react';
import MyAuthContext from '../contexts/MyAuthContext';
import { useParticipants } from './state/useParticipants';

export const useMe = () => {
    const myAuth = React.useContext(MyAuthContext);
    const participantsMap = useParticipants(); 
    if (typeof myAuth === 'string') {
        return { participant: undefined, userUid: undefined };
    }
    return { participant: participantsMap?.get(myAuth.uid), userUid: myAuth.uid };
};