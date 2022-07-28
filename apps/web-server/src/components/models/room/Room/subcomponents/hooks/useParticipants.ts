import React from 'react';
import { recordForEach } from '@flocon-trpg/utils';
import { Master, Player, Spectator, State, participantTemplate } from '@flocon-trpg/core';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';

type ParticipantState = State<typeof participantTemplate>;

type Filter = {
    [Master]: boolean;
    [Player]: boolean;
    [Spectator]: boolean;
};

export const useParticipants = (
    filter?: Filter
): ReadonlyMap<string, ParticipantState> | undefined => {
    const includeMaster = filter?.[Master] ?? true;
    const includePlayer = filter?.[Player] ?? true;
    const includeSpectator = filter?.[Spectator] ?? true;

    const participants = useAtomSelector(roomAtom, state => state.roomState?.state?.participants);
    return React.useMemo(() => {
        if (participants == null) {
            return undefined;
        }

        const result = new Map<string, ParticipantState>();
        recordForEach(participants, (value, key) => {
            switch (value.role) {
                case Master:
                    if (includeMaster) {
                        result.set(key, value);
                    }
                    return;
                case Player:
                    if (includePlayer) {
                        result.set(key, value);
                    }
                    return;
                case Spectator:
                    if (includeSpectator) {
                        result.set(key, value);
                    }
                    return;
                case undefined:
                    return;
            }
        });
        return result;
    }, [participants, includeMaster, includePlayer, includeSpectator]);
};
