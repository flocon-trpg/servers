import { State, participantTemplate } from '@flocon-trpg/core';
import { both, groupJoinMap, left, recordToMap, right } from '@flocon-trpg/utils';
import React from 'react';
import { useParticipants } from './useParticipants';

type ParticipantState = State<typeof participantTemplate>;

type ValueToReturn<T> =
    | {
          hasParticipant: true;
          participant: ParticipantState;
          hasRecordValue: true;
          recordValue: T;
      }
    | {
          hasParticipant: true;
          participant: ParticipantState;
          hasRecordValue: false;
          recordValue: undefined;
      }
    | {
          hasParticipant: false;
          hasRecordValue: true;
          participant: undefined;
          recordValue: T;
      };

type Returns<T> = Map<string, ValueToReturn<T>>;

export function useJoinParticipants<T>(source: Record<string, T> | undefined): Returns<T> {
    const participants = useParticipants();

    return React.useMemo(() => {
        const rightMap: NonNullable<typeof participants> = participants ?? new Map();
        const joinResult = groupJoinMap(recordToMap(source ?? {}), rightMap);

        const result: Returns<T> = new Map();
        joinResult.forEach((value, key) => {
            switch (value.type) {
                case left:
                    result.set(key, {
                        hasParticipant: false,
                        participant: undefined,
                        hasRecordValue: true,
                        recordValue: value.left,
                    });
                    return;
                case right:
                    result.set(key, {
                        hasParticipant: true,
                        participant: value.right,
                        hasRecordValue: false,
                        recordValue: value.left,
                    });
                    return;
                case both:
                    result.set(key, {
                        hasParticipant: true,
                        participant: value.right,
                        hasRecordValue: true,
                        recordValue: value.left,
                    });
            }
        });
        return result;
    }, [participants, source]);
}
