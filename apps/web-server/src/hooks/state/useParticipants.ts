import React from 'react';
import { recordToMap } from '@flocon-trpg/utils';
import { ParticipantState } from '@flocon-trpg/core';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { roomAtom } from '../../atoms/room/roomAtom';

export const useParticipants = (): ReadonlyMap<string, ParticipantState> | undefined => {
    const participants = useAtomSelector(roomAtom, state => state.roomState?.state?.participants);
    return React.useMemo(
        () => (participants == null ? undefined : recordToMap(participants)),
        [participants]
    );
};
