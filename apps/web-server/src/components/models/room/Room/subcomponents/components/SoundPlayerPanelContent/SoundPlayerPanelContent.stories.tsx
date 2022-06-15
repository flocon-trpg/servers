import { ParticipantRole } from '@flocon-trpg/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { SoundPlayerPanelContent } from './SoundPlayerPanelContent';
import { useSetupMocks } from '../../../../../../../hooks/useSetupMocks';

export const Player: React.FC<{ myParticipantRole: ParticipantRole }> = ({ myParticipantRole }) => {
    useSetupMocks({
        roomConfig: {
            myParticipantRole,
        },
    });
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
