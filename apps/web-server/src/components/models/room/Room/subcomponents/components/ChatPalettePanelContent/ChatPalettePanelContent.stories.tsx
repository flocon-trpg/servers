import { ParticipantRole } from '@flocon-trpg/core';
import { getExactlyOneKey } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ChatPalettePanelContent } from './ChatPalettePanelContent';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomId, roomConfig, isInitialized } = useSetupStorybook({
        roomConfig: {
            myParticipantRole,
        },
    });
    if (!isInitialized) {
        return <div />;
    }
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
