import { getExactlyOneKey } from '@flocon-trpg/utils';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RoomMessagesPanelContent } from './RoomMessagesPanelContent';
import { StorybookProvider } from '@/components/behaviors/StorybookProvider';
import { useSetupStorybook } from '@/hooks/useSetupStorybook';
import { CreateMockRoomMessagesParams } from '@/mocks';
import { createMockUrqlClientForRoomMessage } from '@/mocks/createMockUrqlClientForRoomMessage';

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

const meta = {
    title: 'models/room/Room/RoomMessagesPanelContent',
    component: Default,
    args: {
        height: 500,
        setGeneralMessages: true,
        fetchingMessages: false,
    },
} satisfies Meta<typeof Default>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fetching: Story = {
    args: {
        fetchingMessages: true,
    },
};

export const Empty: Story = {
    args: {
        setGeneralMessages: false,
    },
};
