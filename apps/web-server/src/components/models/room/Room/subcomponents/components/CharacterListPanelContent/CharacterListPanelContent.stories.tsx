import { ParticipantRole, State as S, roomTemplate } from '@flocon-trpg/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { CharacterListPanelContent } from './CharacterListPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

type RoomState = S<typeof roomTemplate>;

type StateType = 'none' | 'default';

export const Default: React.FC<{ stateType: StateType; myParticipantRole: ParticipantRole }> = ({
    stateType,
    myParticipantRole,
}) => {
    const updateRoom = React.useMemo(() => {
        switch (stateType) {
            case 'default':
                return undefined;
            case 'none':
                return (roomState: RoomState) => {
                    roomState.characters = {};
                };
        }
    }, [stateType]);
    useSetupMocks({
        roomConfig: {
            myParticipantRole,
            setBoards: stateType === 'default',
            update: updateRoom,
        },
    });

    return (
        <StorybookProvider>
            <CharacterListPanelContent />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/CharacterListPanelContent',
    component: Default,
    args: { myParticipantRole: 'Player', stateType: 'default' },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Empty = Template.bind({});
Empty.args = {
    stateType: 'none',
};

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};
