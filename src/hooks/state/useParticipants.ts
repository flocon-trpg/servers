import React from 'react';
import { recordToMap } from '../../@shared/utils';
import { useSelector } from '../../store';
import * as Participant from '../../@shared/ot/room/participant/v1';

export const useParticipants = (): ReadonlyMap<string, Participant.State> | undefined => {
    const participants = useSelector(state => state.roomModule.roomState?.state?.participants);
    return React.useMemo(() => participants == null ? undefined : recordToMap(participants), [participants]);
};