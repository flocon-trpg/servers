import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { RoomMessagesPanelContent } from './RoomMessagesPanelContent';
import { storybookAtom } from '../../../../../../atoms/storybook/storybookAtom';
import { useMockRoom } from '../../../../../../hooks/useMockRoom';
import { useMockRoomMessages } from '../../../../../../hooks/useRoomMessages';
import { roomConfigAtom } from '../../../../../../atoms/roomConfig/roomConfigAtom';
import { defaultRoomConfig } from '../../../../../../atoms/roomConfig/types/roomConfig';
import { Result } from '@kizahasi/result';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    CreateMockRoomMessagesParams,
    createMockRoom,
    createMockRoomMessages,
    mockAuth,
    mockUser,
} from '../../../../../../mocks';
import { useMockUserConfig } from '../../../../../../hooks/useMockUserConfig';
import { getExactlyOneKey } from '@flocon-trpg/utils';

const roomId = '';

const room = createMockRoom({
    myParticipantRole: 'Player',
    setCharacterTagNames: true,
    setPublicChannelNames: true,
    setBoards: true,
    setCharacters: true,
    setParamNames: true,
});

export const Default: React.FC<
    { height: number; fetchingMessages: boolean } & CreateMockRoomMessagesParams
> = ({ height, fetchingMessages, setGeneralMessages }) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: mockUser },
                webConfig: Result.ok({
                    isUnlistedFirebaseStorageEnabled: false,
                    isPublicFirebaseStorageEnabled: false,
                    firebaseConfig: {
                        apiKey: '',
                        appId: '',
                        authDomain: '',
                        messagingSenderId: '',
                        projectId: '',
                        storageBucket: '',
                    },
                }),
                user: mockUser,
            },
        });
    }, [setStorybook]);
    useMockRoom({ roomId, room });
    useMockUserConfig();
    const { onQuery, setAsNotFetch } = useMockRoomMessages();
    React.useEffect(() => {
        setAsNotFetch();
        if (fetchingMessages) {
            return;
        }
        onQuery(createMockRoomMessages({ setGeneralMessages }));
    }, [onQuery, setAsNotFetch, fetchingMessages, setGeneralMessages]);
    const setRoomConfig = useSetAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => defaultRoomConfig(roomId), []);
    React.useEffect(() => {
        setRoomConfig(roomConfig);
    }, [roomConfig, setRoomConfig]);
    return (
        <DndProvider backend={HTML5Backend}>
            <RoomMessagesPanelContent
                panelId={getExactlyOneKey(roomConfig.panels.messagePanels)}
                height={height}
            />
        </DndProvider>
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
