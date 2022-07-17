import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { RoomMessagesPanelContent } from './RoomMessagesPanelContent';
import { CreateMockRoomMessagesParams } from '@/mocks';
import { getExactlyOneKey } from '@flocon-trpg/utils';
import { useSetupMocks } from '@/hooks/useSetupMocks';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';

export const Default: React.FC<
    { height: number; fetchingMessages: boolean } & CreateMockRoomMessagesParams
> = ({ height, fetchingMessages, setGeneralMessages }) => {
    const { roomConfig } = useSetupMocks({
        roomMessagesConfig: {
            setGeneralMessages,
            doNotQuery: fetchingMessages,
        },
    });
    return (
        <StorybookProvider>
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
