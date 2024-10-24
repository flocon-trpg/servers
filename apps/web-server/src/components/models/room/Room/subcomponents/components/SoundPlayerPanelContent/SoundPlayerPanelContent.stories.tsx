import { ParticipantRole } from '@flocon-trpg/core';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SoundPlayerPanelContent } from './SoundPlayerPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { createMockUrqlClient } from '@/mocks';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole,
        },
    });
    const mockUrqlClient = React.useRef(createMockUrqlClient());
    return (
        <StorybookProvider
            compact
            roomClientContextValue={roomClientContextValue}
            urqlClient={mockUrqlClient.current}
        >
            <SoundPlayerPanelContent />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/SoundPlayerPanelContent',
    component: Player,
    args: { myParticipantRole: 'Player' },
} satisfies Meta<typeof Player>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spectator: Story = {
    args: {
        myParticipantRole: 'Spectator',
    },
};
