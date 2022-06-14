import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { Result } from '@kizahasi/result';
import { Room } from './Room';
import { WebConfig } from '../../../../configType';
import { storybookAtom } from '../../../../atoms/storybookAtom/storybookAtom';
import { useMockRoom } from '../../../../hooks/useMockRoom';
import { roomConfigAtom } from '../../../../atoms/roomConfigAtom/roomConfigAtom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { defaultRoomConfig } from '../../../../atoms/roomConfigAtom/types/roomConfig';
import {
    createMockRoom,
    createMockRoomMessages,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
} from '../../../../mocks';
import { ParticipantRole } from '@flocon-trpg/core';
import { useMockRoomMessages } from '../../../../hooks/useRoomMessages';
import { useMockUserConfig } from '../../../../hooks/useMockUserConfig';

const roomId = '';

export const Player: React.FC<WebConfig & { myParticipantRole: ParticipantRole }> = ({
    isUnlistedFirebaseStorageEnabled,
    isPublicFirebaseStorageEnabled,
    myParticipantRole,
}) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: mockUser },
                webConfig: Result.ok({
                    ...mockWebConfig,
                    isUnlistedFirebaseStorageEnabled,
                    isPublicFirebaseStorageEnabled,
                }),
                user: mockUser,
                storage: mockStorage,
            },
        });
    }, [isPublicFirebaseStorageEnabled, isUnlistedFirebaseStorageEnabled, setStorybook]);
    const room = React.useMemo(() => {
        return createMockRoom({
            myParticipantRole,
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setBoards: true,
            setCharacters: true,
            setParamNames: true,
        });
    }, [myParticipantRole]);
    useMockRoom({ roomId, room });
    useMockUserConfig();
    const { onQuery, setAsNotFetch } = useMockRoomMessages();
    React.useEffect(() => {
        setAsNotFetch();
        onQuery(createMockRoomMessages({ setGeneralMessages: true }));
    }, [onQuery, setAsNotFetch]);
    const setRoomConfig = useSetAtom(roomConfigAtom);
    React.useEffect(() => {
        setRoomConfig(defaultRoomConfig(roomId));
    }, [setRoomConfig]);
    return (
        <DndProvider backend={HTML5Backend}>
            <Room debug={{ window: { innerHeight: 600, innerWidth: 500 } }} />
        </DndProvider>
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
