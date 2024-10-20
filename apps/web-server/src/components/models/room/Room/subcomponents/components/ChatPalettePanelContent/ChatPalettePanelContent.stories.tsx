import { ParticipantRole } from '@flocon-trpg/core';
import { getExactlyOneKey } from '@flocon-trpg/utils';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ChatPalettePanelContent } from './ChatPalettePanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { createMockUrqlClientForRoomMessage } from '@/mocks/createMockUrqlClientForRoomMessage';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomId, roomConfig, roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole,
        },
    });
    const mockUrqlClient = React.useRef(createMockUrqlClientForRoomMessage());
    return (
        <div style={{ height: 400 }}>
            <StorybookProvider
                compact
                roomClientContextValue={roomClientContextValue}
                urqlClient={mockUrqlClient.current}
            >
                <ChatPalettePanelContent
                    roomId={roomId}
                    panelId={getExactlyOneKey(roomConfig.panels.chatPalettePanels)}
                />
            </StorybookProvider>
        </div>
    );
};

const meta = {
    title: 'models/room/Room/ChatPalettePanelContent',
    component: Player,
    args: {
        myParticipantRole: 'Player',
    },
} satisfies Meta<typeof Player>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spectator: Story = {
    args: {
        myParticipantRole: 'Spectator',
    },
};
