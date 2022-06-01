import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { RoomMessages } from './RoomMessages';
import { storybookAtom } from '../../../../atoms/storybook/storybookAtom';
import { useMockRoom } from '../../../../hooks/useMockRoom';
import { useMockRoomMessages } from '../../../../hooks/useRoomMessages';
import { useUpdateAtom } from 'jotai/utils';
import { roomConfigAtom } from '../../../../atoms/roomConfig/roomConfigAtom';
import { defaultRoomConfig } from '../../../../atoms/roomConfig/types/roomConfig';
import { Result } from '@kizahasi/result';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    CreateMockRoomMessagesParams,
    createMockRoom,
    createMockRoomMessages,
    mockAuth,
    mockUser,
} from '../../../../mocks';
import { useMockUserConfig } from '../../../../hooks/useMockUserConfig';

const roomId = '';

const getExactlyOneKey = (record: Record<string, unknown>): string => {
    const keys = [];
    for (const key in record) {
        keys.push(key);
    }
    if (keys.length === 1) {
        return keys[0]!;
    }
    throw new Error();
};

const room = createMockRoom({
    myParticipantRole: 'Player',
    setCharacterTagNames: true,
    setPublicChannelNames: true,
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
    const { onQuery, setToNotFetch } = useMockRoomMessages();
    React.useEffect(() => {
        setToNotFetch();
        if (fetchingMessages) {
            return;
        }
        onQuery(createMockRoomMessages({ setGeneralMessages }));
    }, [onQuery, setToNotFetch, fetchingMessages, setGeneralMessages]);
    const setRoomConfig = useUpdateAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => defaultRoomConfig(roomId), []);
    React.useEffect(() => {
        setRoomConfig(roomConfig);
    }, [roomConfig, setRoomConfig]);
    return (
        <DndProvider backend={HTML5Backend}>
            <RoomMessages
                panelId={getExactlyOneKey(roomConfig.panels.messagePanels)}
                height={height}
            />
        </DndProvider>
    );
};

export default {
    title: 'Contextual/Room/Messages/RoomMessages',
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