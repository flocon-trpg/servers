import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { ChatPalettePanelContent } from './ChatPalettePanelContent';
import { storybookAtom } from '../../../../../../atoms/storybook/storybookAtom';
import { useMockRoom } from '../../../../../../hooks/useMockRoom';
import { defaultRoomConfig } from '../../../../../../atoms/roomConfig/types/roomConfig';
import { roomConfigAtom } from '../../../../../../atoms/roomConfig/roomConfigAtom';
import { getExactlyOneKey } from '@flocon-trpg/utils';
import { createMockRoom, mockAuth, mockUser } from '../../../../../../mocks';
import { ParticipantRole } from '@flocon-trpg/core';

const roomId = '';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
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
            setBoards: true,
            setCharacters: true,
            setParamNames: true,
        });
    }, [myParticipantRole]);
    useMockRoom({ roomId, room });
    const setRoomConfig = useSetAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => defaultRoomConfig(roomId), []);
    React.useEffect(() => {
        setRoomConfig(roomConfig);
    }, [roomConfig, setRoomConfig]);
    return (
        <div style={{ height: 400 }}>
            <ChatPalettePanelContent
                roomId={roomId}
                panelId={getExactlyOneKey(roomConfig.panels.chatPalettePanels)}
            />
        </div>
    );
};

export default {
    title: 'models/room/Room/ChatPalettePanelContent',
    component: Player,
    args: {
        myParticipantRole: 'Player',
    },
} as ComponentMeta<typeof Player>;

const Template: ComponentStory<typeof Player> = args => <Player {...args} />;

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};
