import { ParticipantRole } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Room } from './Room';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { WebConfig } from '@/configType';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { mockWebConfig } from '@/mocks';
import { createMockUrqlClientForRoomMessage } from '@/mocks/createMockUrqlClientForRoomMessage';

export const Player: React.FC<WebConfig & { myParticipantRole: ParticipantRole }> = ({
    isUnlistedFirebaseStorageEnabled,
    isPublicFirebaseStorageEnabled,
    myParticipantRole,
}) => {
    const webConfig = React.useMemo(() => {
        return Result.ok({
            ...mockWebConfig,
            isUnlistedFirebaseStorageEnabled,
            isPublicFirebaseStorageEnabled,
        });
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

export default {
    title: 'models/room/Room',
    component: Player,
    args: { myParticipantRole: 'Player' },
    parameters: {
        chromatic: { delay: 1000 },
    },
} as ComponentMeta<typeof Player>;

const Template: ComponentStory<typeof Player> = args => <Player {...args} />;

export const Master = Template.bind({});
Master.args = {
    myParticipantRole: 'Master',
};

export const Spectator = Template.bind({});
Spectator.args = {
    myParticipantRole: 'Spectator',
};
