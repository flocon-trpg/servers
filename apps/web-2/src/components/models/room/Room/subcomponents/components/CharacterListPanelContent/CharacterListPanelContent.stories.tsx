import { ParticipantRole, State as S, roomTemplate } from '@flocon-trpg/core';
import React from 'react';
import { CharacterListPanelContent } from './CharacterListPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { Meta, StoryObj } from '@storybook/react';

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
    const { roomClientContextValue } = useSetupStorybook({
        room: {
            myParticipantRole,
            setBoards: stateType === 'default',
            update: updateRoom,
        },
    });

    return (
        <StorybookProvider compact roomClientContextValue={roomClientContextValue}>
            <CharacterListPanelContent height={400} />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room/CharacterListPanelContent',
    component: Default,
    args: { myParticipantRole: 'Player', stateType: 'default' },
} satisfies Meta<typeof Default>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = ({
    args: {
    stateType: 'none',
    }
});

export const Spectator: Story = ({
    args: {
    myParticipantRole: 'Spectator',
    }
});
