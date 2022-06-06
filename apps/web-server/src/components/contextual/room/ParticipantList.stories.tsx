import { ParticipantRole } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { roomConfigAtom } from '../../../atoms/roomConfig/roomConfigAtom';
import { defaultRoomConfig } from '../../../atoms/roomConfig/types/roomConfig';
import { storybookAtom } from '../../../atoms/storybook/storybookAtom';
import { useMockUserConfig } from '../../../hooks/useMockUserConfig';
import { createMockRoom, mockAuth, mockStorage, mockUser, mockWebConfig } from '../../../mocks';
import { useMockRoom } from '../../../hooks/useMockRoom';
import { ParticipantList } from './ParticipantList';

const roomId = '';

export const Master: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: mockUser },
                user: mockUser,
            },
        });
    }, [setStorybook]);
    const room = React.useMemo(() => {
        return createMockRoom({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setCharacters: true,
            setParamNames: true,
        });
    }, [myParticipantRole]);
    useMockRoom({ roomId, room });
    useMockUserConfig();
    const setRoomConfig = useSetAtom(roomConfigAtom);
    React.useEffect(() => {
        setRoomConfig(defaultRoomConfig(roomId));
    }, [setRoomConfig]);
    return <ParticipantList />;
};

export default {
    title: 'Contextual/Room/ParticipantList',
    component: Master,
    args: { myParticipantRole: 'Master' },
} as ComponentMeta<typeof Master>;

const Template: ComponentStory<typeof Master> = args => <Master {...args} />;

export const Player = Template.bind({});
Player.args = {
    myParticipantRole: 'Player',
};

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};
