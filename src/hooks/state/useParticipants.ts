import React from 'react';
import { useSelector } from '../../store';
import { recordToMap } from '@kizahasi/util';
import { ParticipantState } from '@kizahasi/flocon-core';

export const useParticipants = (): ReadonlyMap<string, ParticipantState> | undefined => {
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    return React.useMemo(
        () => (participants == null ? undefined : recordToMap(participants)),
        [participants]
    );
};
