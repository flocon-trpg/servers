import { Player, Spectator, State, forceMaxLength100String, roomTemplate } from '@flocon-trpg/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { RollCall } from './RollCall';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { mockUser } from '@/mocks';

const currentDateTime = 1_000_000_000_000;

type RoomState = State<typeof roomTemplate>;
type RollCallState = NonNullable<RoomState['rollCalls']>[string];

const myUserUid = mockUser.uid;
const player1Uid = 'player1Uid';
const player2Uid = 'player2Uid';
const player3Uid = 'player3Uid';
const spectatorUid = 'spectatorUid';

const baseRoomState: RoomState = {
    $v: 2,
    $r: 1,
    activeBoardId: undefined,
    createdBy: '',
    name: '',
    boolParamNames: undefined,
    numParamNames: undefined,
    strParamNames: undefined,
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
    bgms: undefined,
    boards: undefined,
    characters: undefined,
    memos: undefined,
    participants: {
        [myUserUid]: {
            $v: 2,
            $r: 1,
            name: forceMaxLength100String('[2]自分のユーザー名'),
            role: Player,
        },
        [player1Uid]: {
            $v: 2,
            $r: 1,
            name: forceMaxLength100String('[1]参加者1のユーザー名'),
            role: Player,
        },
        [player2Uid]: {
            $v: 2,
            $r: 1,
            name: forceMaxLength100String('[3]参加者2のユーザー名'),
            role: Player,
        },
        [player3Uid]: {
            $v: 2,
            $r: 1,
            name: forceMaxLength100String('[4]参加者3のユーザー名'),
            role: Player,
        },
        [spectatorUid]: {
            $v: 2,
            $r: 1,
            name: forceMaxLength100String('観戦者のユーザー名(これは通常は表示されません)'),
            role: Spectator,
        },
    },
    rollCalls: undefined,
};

const closedRollCall: RollCallState = {
    $v: 1,
    $r: 1,
    createdAt: currentDateTime - 200_000,
    createdBy: myUserUid,
    closeStatus: {
        closedBy: player1Uid,
        reason: 'Closed',
    },
    participants: {
        [myUserUid]: {
            $v: 1,
            $r: 1,
            answeredAt: currentDateTime - 200_000,
        },
        [player1Uid]: {
            $v: 1,
            $r: 1,
            answeredAt: currentDateTime - 150_000,
        },
        [player2Uid]: {
            $v: 1,
            $r: 1,
            answeredAt: undefined,
        },
    },
    soundEffect: undefined,
};

const stateForClosedRollCall: RoomState = {
    ...baseRoomState,
    rollCalls: {
        ['closedRollCallId']: closedRollCall,
    },
};

const stateForOpenAndAnswered: RoomState = {
    ...baseRoomState,
    rollCalls: {
        ['closedRollCallId']: closedRollCall,
        ['openRollCallId']: {
            $v: 1,
            $r: 1,
            createdAt: currentDateTime - 100_000,
            createdBy: myUserUid,
            closeStatus: undefined,
            participants: {
                [myUserUid]: {
                    $v: 1,
                    $r: 1,
                    answeredAt: currentDateTime - 100_000,
                },
                [player1Uid]: {
                    $v: 1,
                    $r: 1,
                    answeredAt: currentDateTime - 50_000,
                },
            },
            soundEffect: undefined,
        },
    },
};

const stateForOpenAndNotAnswered: RoomState = {
    ...baseRoomState,
    rollCalls: {
        ['closedRollCallId']: closedRollCall,
        ['openRollCallId']: {
            $v: 1,
            $r: 1,
            createdAt: currentDateTime - 100_000,
            createdBy: myUserUid,
            closeStatus: undefined,
            participants: {
                [myUserUid]: {
                    $v: 1,
                    $r: 1,
                    answeredAt: undefined,
                },
                [player1Uid]: {
                    $v: 1,
                    $r: 1,
                    answeredAt: currentDateTime - 50_000,
                },
            },
            soundEffect: undefined,
        },
    },
};

export const Default: React.FC<{ roomState: RoomState }> = ({ roomState }) => {
    useSetupStorybook({
        room: {
            custom: roomState,
        },
    });
    return (
        <StorybookProvider waitForRoomClient>
            <RollCall
                rollCalls={roomState.rollCalls ?? {}}
                mockDate={() => new Date(currentDateTime)}
            />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/RollCall',
    component: Default,
    args: { roomState: baseRoomState },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Closed = Template.bind({});
Closed.args = { roomState: stateForClosedRollCall };

export const OpenAndAnswered = Template.bind({});
OpenAndAnswered.args = { roomState: stateForOpenAndAnswered };

export const OpenAndNotAnswered = Template.bind({});
OpenAndNotAnswered.args = { roomState: stateForOpenAndNotAnswered };
