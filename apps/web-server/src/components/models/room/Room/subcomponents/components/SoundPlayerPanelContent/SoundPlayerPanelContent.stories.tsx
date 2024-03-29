import { ParticipantRole } from '@flocon-trpg/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { SoundPlayerPanelContent } from './SoundPlayerPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole,
        },
    });
    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <SoundPlayerPanelContent />
        </StorybookProvider>
    );
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
