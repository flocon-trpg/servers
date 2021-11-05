import React from 'react';
import { useSelector } from '../../store';
import { recordToMap } from '@flocon-trpg/utils';
import { ParticipantState } from '@flocon-trpg/core';

export const useParticipants = (): ReadonlyMap<string, ParticipantState> | undefined => {
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    return React.useMemo(
        () => (participants == null ? undefined : recordToMap(participants)),
        [participants]
    );
};
