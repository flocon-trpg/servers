import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Result } from '@kizahasi/result';
import { Room } from './Room';
import { WebConfig } from '@/configType';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { mockWebConfig } from '@/mocks';
import { ParticipantRole } from '@flocon-trpg/core';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

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
    useSetupMocks({
        basicMock: {
            webConfig,
        },
        roomConfig: {
            myParticipantRole,
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <DndProvider backend={HTML5Backend}>
                <Room debug={{ window: { innerHeight: 600, innerWidth: 500 } }} />
            </DndProvider>
        </QueryClientProvider>
    );
};

export default {
    title: 'models/room/Room',
    component: Player,
    args: { myParticipantRole: 'Player' },
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
