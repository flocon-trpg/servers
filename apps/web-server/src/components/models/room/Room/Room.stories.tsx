import { ParticipantRole } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Room } from './Room';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { WebConfig } from '@/configType';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { mockWebConfig } from '@/mocks';
import { createMockUrqlClientForRoomMessage } from '@/mocks/createMockUrqlClientForRoomMessage';

export const Player: React.FC<
    Pick<WebConfig, 'isUnlistedFirebaseStorageEnabled' | 'isPublicFirebaseStorageEnabled'> & {
        myParticipantRole: ParticipantRole;
    }
> = ({ isUnlistedFirebaseStorageEnabled, isPublicFirebaseStorageEnabled, myParticipantRole }) => {
    const webConfig = React.useMemo(() => {
        return {
            ...mockWebConfig,
            isUnlistedFirebaseStorageEnabled,
            isPublicFirebaseStorageEnabled,
        };
    }, [isPublicFirebaseStorageEnabled, isUnlistedFirebaseStorageEnabled]);
    const { roomClientContextValue } = useSetupStorybook({
        basicMock: {
            webConfig,
        },
        room: {
            myParticipantRole,
        },
    });
    const mockUrqlClient = React.useRef(createMockUrqlClientForRoomMessage());

    return (
        <StorybookProvider
            compact
            roomClientContextValue={roomClientContextValue}
            urqlClient={mockUrqlClient.current}
        >
            <Room debug={{ window: { innerHeight: 600, innerWidth: 500 } }} />
        </StorybookProvider>
    );
};

const meta = {
    title: 'models/room/Room',
    component: Player,
    args: {
        myParticipantRole: 'Player',
        isPublicFirebaseStorageEnabled: false,
        isUnlistedFirebaseStorageEnabled: false,
    },
    parameters: {
        chromatic: { delay: 1000 },
    },
} satisfies Meta<typeof Player>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Master: Story = {
    args: {
        myParticipantRole: 'Master',
        isPublicFirebaseStorageEnabled: false,
        isUnlistedFirebaseStorageEnabled: false,
    },
};

export const Spectator: Story = {
    args: {
        myParticipantRole: 'Spectator',
        isPublicFirebaseStorageEnabled: false,
        isUnlistedFirebaseStorageEnabled: false,
    },
};
