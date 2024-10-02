import { Master, Player, State, getOpenRollCall, roomTemplate, simpleId } from '@flocon-trpg/core';
import { recordToArray } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
import { maxBy } from 'lodash';
import { PerformRollCallFailureType } from '@/enums/PerformRollCallFailureType';

const maxRollCallHistoryCount = 3;
const minimumTimeWindow = 60_000;

type RoomState = State<typeof roomTemplate>;
type RollCallsState = NonNullable<RoomState['rollCalls']>;
type RollCallState = NonNullable<RollCallsState[string]>;

export const performRollCall = (
    source: RoomState,
    myUserUid: string,
    soundEffect: RollCallState['soundEffect'],
): Result<RoomState, PerformRollCallFailureType> => {
    const me = source.participants?.[myUserUid];
    switch (me?.role) {
        case Master:
        case Player:
            break;
        default:
            return Result.error(PerformRollCallFailureType.NotAuthorizedParticipant);
    }
    const openRollCall = getOpenRollCall(source.rollCalls ?? {});
    if (openRollCall != null) {
        return Result.error(PerformRollCallFailureType.HasOpenRollCall);
    }
    const maxCreatedAt = maxBy(
        recordToArray(source.rollCalls ?? {}),
        ({ value }) => value.createdAt,
    )?.value.createdAt;
    if (maxCreatedAt != null) {
        const elapsed = new Date().getTime() - maxCreatedAt;
        if (elapsed < minimumTimeWindow) {
            return Result.error(PerformRollCallFailureType.TooManyRequests);
        }
    }
    const result = produce(source, source => {
        const openRollCall = getOpenRollCall(source.rollCalls ?? {});
        if (openRollCall != null) {
            return;
        }
        const key = simpleId();
        if (source.rollCalls == null) {
            source.rollCalls = {};
        }

        recordToArray(source.rollCalls)
            .slice(maxRollCallHistoryCount)
            .forEach(({ key }) => {
                if (source.rollCalls == null) {
                    return;
                }
                source.rollCalls[key] = undefined;
            });

        source.rollCalls[key] = {
            $v: 1,
            $r: 1,
            createdAt: new Date().getTime(),
            createdBy: myUserUid,
            participants: {
                [myUserUid]: {
                    $v: 1,
                    $r: 1,
                    answeredAt: new Date().getTime(),
                },
            },
            closeStatus: undefined,
            soundEffect,
        };
    });
    return Result.ok(result);
};
