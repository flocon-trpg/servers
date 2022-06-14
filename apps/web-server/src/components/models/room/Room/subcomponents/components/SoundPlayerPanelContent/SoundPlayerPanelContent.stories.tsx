import { ParticipantRole } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { roomConfigAtom } from '../../../../../../../atoms/roomConfigAtom/roomConfigAtom';
import { defaultRoomConfig } from '../../../../../../../atoms/roomConfigAtom/types/roomConfig';
import { storybookAtom } from '../../../../../../../atoms/storybookAtom/storybookAtom';
import { useMockUserConfig } from '../../../../../../../hooks/useMockUserConfig';
import {
    createMockRoom,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
} from '../../../../../../../mocks';
import { SoundPlayerPanelContent } from './SoundPlayerPanelContent';
import { useMockRoom } from '../../../../../../../hooks/useMockRoom';

const roomId = '';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: mockUser },
                webConfig: Result.ok(mockWebConfig),
                user: mockUser,
                storage: mockStorage,
            },
        });
    }, [setStorybook]);
    const room = React.useMemo(() => {
        return createMockRoom({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setBoards: true,
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
    return <SoundPlayerPanelContent />;
};

export default {
    title: 'models/room/Room/SoundPlayerPanelContent',
    component: Player,
    args: { myParticipantRole: 'Player' },
} as ComponentMeta<typeof Player>;

const Template: ComponentStory<typeof Player> = args => <Player {...args} />;

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};
