import { Master, Player, Spectator, State, participantTemplate } from '@flocon-trpg/core';
import { recordForEach } from '@flocon-trpg/utils';
import React from 'react';
import { useRoomStateValueSelector } from '@/hooks/useRoomStateValueSelector';

type ParticipantState = State<typeof participantTemplate>;

type Filter = {
    [Master]: boolean;
    [Player]: boolean;
    [Spectator]: boolean;
};

/**
 * Participant を取得します。
 *
 * 代わりに `useJoinParticipants` の使用も検討してください。
 */
export const useParticipants = (
    filter?: Filter
): ReadonlyMap<string, ParticipantState> | undefined => {
    const includeMaster = filter?.[Master] ?? true;
    const includePlayer = filter?.[Player] ?? true;
    const includeSpectator = filter?.[Spectator] ?? true;

    const participants = useRoomStateValueSelector(state => state.participants);
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
