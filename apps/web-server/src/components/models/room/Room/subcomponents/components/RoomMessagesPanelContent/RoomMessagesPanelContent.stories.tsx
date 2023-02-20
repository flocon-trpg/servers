import { getExactlyOneKey } from '@flocon-trpg/utils';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { RoomMessagesPanelContent } from './RoomMessagesPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { CreateMockRoomMessagesParams } from '@/mocks';
import { createMockUrqlClientForRoomMessage } from '@/mocks/mockAvailableGameSystemsQuery';

export const Default: React.FC<
    { height: number; fetchingMessages: boolean } & CreateMockRoomMessagesParams
> = ({ height, fetchingMessages, setGeneralMessages }) => {
    const { roomConfig, roomClientContextValue } = useSetupStorybook({
        roomMessagesConfig: {
            setGeneralMessages,
            doNotQuery: fetchingMessages,
        },
    });
    const mockUrqlClient = React.useRef(createMockUrqlClientForRoomMessage());
    return (
        <StorybookProvider
            compact
            roomClientContextValue={roomClientContextValue}
            urqlClient={mockUrqlClient.current}
        >
            <RoomMessagesPanelContent
                panelId={getExactlyOneKey(roomConfig.panels.messagePanels)}
                height={height}
            />
        </StorybookProvider>
    );
};

export default {
    title: 'models/room/Room/RoomMessagesPanelContent',
    component: Default,
    args: {
        height: 500,
        setGeneralMessages: true,
        fetchingMessages: false,
    },
} as ComponentMeta<typeof Default>;

const Template: ComponentStory<typeof Default> = args => <Default {...args} />;

export const Fetching = Template.bind({});
Fetching.args = {
    fetchingMessages: true,
};

export const Empty = Template.bind({});
Empty.args = {
    setGeneralMessages: false,
};
