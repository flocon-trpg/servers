import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { ChatPalettePanelContent } from './ChatPalettePanelContent';
import { getExactlyOneKey } from '@flocon-trpg/utils';
import { ParticipantRole } from '@flocon-trpg/core';
import { useSetupMocks } from '@/hooks/useSetupMocks';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomId, roomConfig } = useSetupMocks({
        roomConfig: {
            myParticipantRole,
        },
    });
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
