import { Master, Player, Spectator, State, roomTemplate } from '@flocon-trpg/core';
import { recordToArray } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { PerformRollCallFailureType } from '../../../../enums/PerformRollCallFailureType';
import { convertToMaxLength100String } from '../../../../utils/convertToMaxLength100String';
import { performRollCall } from './performRollCall';

const playerUserUid = 'user2';

type RoomState = State<typeof roomTemplate>;
const baseState: RoomState = {
    $v: 2,
    $r: 1,
    activeBoardId: undefined,
    createdBy: 'CREATED_BY',
    name: 'ROOM_NAME',
    bgms: {},
    boards: {},
    characters: {},
    participants: {
        ['user1']: {
            $v: 2,
            $r: 1,
            name: convertToMaxLength100String('user1-name'),
            role: Master,
        },
        [playerUserUid]: {
            $v: 2,
            $r: 1,
            name: convertToMaxLength100String('user2-name'),
            role: Player,
        },
        ['user3']: {
            $v: 2,
            $r: 1,
            name: convertToMaxLength100String('user3-name'),
            role: Spectator,
        },
    },
    boolParamNames: {},
    numParamNames: {},
    strParamNames: {},
    memos: {},
    rollCalls: {},
    characterTag1Name: undefined,
    characterTag2Name: undefined,
    characterTag3Name: undefined,
    characterTag4Name: undefined,
    characterTag5Name: undefined,
    characterTag6Name: undefined,
    characterTag7Name: undefined,
    characterTag8Name: undefined,
    characterTag9Name: undefined,
    characterTag10Name: undefined,
    publicChannel1Name: '',
    publicChannel2Name: '',
    publicChannel3Name: '',
    publicChannel4Name: '',
    publicChannel5Name: '',
    publicChannel6Name: '',
    publicChannel7Name: '',
    publicChannel8Name: '',
    publicChannel9Name: '',
    publicChannel10Name: '',
};

describe('startRollCall', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('checks RollCall properies', () => {
        jest.setSystemTime(1_000_000_000);

        const actual = performRollCall(baseState, playerUserUid, {
            file: { $v: 1, $r: 1, path: 'FILE_PATH', sourceType: 'Default' },
            volume: 0.5,
        });
        if (actual.isError) {
            throw new Error('expected to return OK, but actually error');
        }
        const actualRollCalls = recordToArray(actual.value.rollCalls ?? {});
        expect(actualRollCalls).toHaveLength(1);
        const actualRollCall = actualRollCalls[0]!;

        expect(actualRollCall.value.createdAt).toBe(1_000_000_000);
        expect(actualRollCall.value.closeStatus).toBeUndefined();
        expect(actualRollCall.value.createdBy).toBe(playerUserUid);
        expect(actualRollCall.value.participants).toEqual({
            [playerUserUid]: {
                $v: 1,
                $r: 1,
                answeredAt: 1_000_000_000,
            },
        });
        expect(actualRollCall.value.soundEffect).toEqual({
            file: { $v: 1, $r: 1, path: 'FILE_PATH', sourceType: 'Default' },
            volume: 0.5,
        });
    });

    it('should return HasOpenRollCall error', () => {
        jest.setSystemTime(1_100_000_000);

        const state: RoomState = {
            ...baseState,
            rollCalls: {
                ['rollCallId']: {
                    $v: 1,
                    $r: 1,
                    createdAt: 1_000_000_000,
                    createdBy: 'createdBy',
                    participants: {
                        ['createdBy']: {
                            $v: 1,
                            $r: 1,
                            answeredAt: 1_000_000_000,
                        },
                    },
                    closeStatus: undefined,
                    soundEffect: undefined,
                },
            },
        };

        const actual = performRollCall(state, playerUserUid, undefined);
        expect(actual).toEqual(Result.error(PerformRollCallFailureType.HasOpenRollCall));
    });

    it('should reject creating multple roll calls in short time', () => {
        jest.setSystemTime(1_000_010_000);

        const state: RoomState = {
            ...baseState,
            rollCalls: {
                ['rollCallId']: {
                    $v: 1,
                    $r: 1,
                    createdAt: 1_000_000_000,
                    createdBy: 'createdBy',
                    participants: {
                        ['createdBy']: {
                            $v: 1,
                            $r: 1,
                            answeredAt: 1_000_000_000,
                        },
                    },
                    closeStatus: { closedBy: 'createdBy', reason: 'Closed' },
                    soundEffect: undefined,
                },
            },
        };

        const actual = performRollCall(state, playerUserUid, undefined);
        expect(actual).toEqual(Result.error(PerformRollCallFailureType.TooManyRequests));
    });
});
