import { Result } from '@kizahasi/result';
import { ComponentMeta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import React from 'react';
import { roomConfigAtom } from '../../../../../../../atoms/roomConfigAtom/roomConfigAtom';
import { defaultRoomConfig } from '../../../../../../../atoms/roomConfigAtom/types/roomConfig';
import { storybookAtom } from '../../../../../../../atoms/storybookAtom/storybookAtom';
import { useMockRoom } from '../../../../../../../hooks/useMockRoom';
import { useMockUserConfig } from '../../../../../../../hooks/useMockUserConfig';
import { useMockRoomMessages } from '../../../../../../../hooks/useRoomMessages';
import {
    createMockRoom,
    createMockRoomMessages,
    defaultBoardId,
    imagePieceKey1,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
} from '../../../../../../../mocks';
import { ImagePieceEditor } from './ImagePieceEditor';

const roomId = '';

export const Update: React.FC = () => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: { ...mockAuth, currentUser: mockUser },
                webConfig: Result.ok(mockWebConfig),
                user: mockUser,
                storage: mockStorage,
            },
        });
    }, [setStorybook]);
    const room = React.useMemo(() => {
        return createMockRoom({
            myParticipantRole: 'Player',
            setCharacterTagNames: true,
            setPublicChannelNames: true,
            setBoards: true,
            setCharacters: true,
            setParamNames: true,
        });
    }, []);
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
    return <ImagePieceEditor updateMode={{ boardId: defaultBoardId, pieceId: imagePieceKey1 }} />;
};

export default {
    title: 'models/room/Room/ImagePieceEditor',
    component: Update,
} as ComponentMeta<typeof Update>;
