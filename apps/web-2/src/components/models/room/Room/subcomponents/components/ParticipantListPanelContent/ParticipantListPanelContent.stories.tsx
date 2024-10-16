import { ParticipantRole } from '@flocon-trpg/core';
import React from 'react';
import { ParticipantListPanelContent } from './ParticipantListPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { Meta, StoryObj } from '@storybook/react';

export const Master: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomClientContextValue } = useSetupStorybook({ room: { myParticipantRole } });

    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <ParticipantListPanelContent />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/ParticipantListPanelContent',
    component: Master,
    args: { myParticipantRole: 'Master' },
} satisfies Meta<typeof Master>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Player: Story = ({
    args: {
    myParticipantRole: 'Player',
    }
});

export const Spectator:Story = ({
    args: {
    myParticipantRole: 'Spectator',
    }
});
