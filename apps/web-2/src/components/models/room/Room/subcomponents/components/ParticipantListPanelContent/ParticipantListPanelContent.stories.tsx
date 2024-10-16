import { ParticipantRole } from '@flocon-trpg/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ParticipantListPanelContent } from './ParticipantListPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';

export const Master: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    const { roomClientContextValue } = useSetupStorybook({ room: { myParticipantRole } });

    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <ParticipantListPanelContent />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/ParticipantListPanelContent',
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
