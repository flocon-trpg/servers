import React from 'react';
import { Auth } from '@firebase/auth';
import { FirebaseStorage } from '@firebase/storage';
import { Result } from '@kizahasi/result';
import { useSetAtom } from 'jotai';
import { roomConfigAtom } from '../atoms/roomConfigAtom/roomConfigAtom';
import { defaultRoomConfig } from '../atoms/roomConfigAtom/types/roomConfig';
import { storybookAtom } from '../atoms/storybookAtom/storybookAtom';
import { WebConfig } from '../configType';
import {
    createMockRoom,
    createMockRoomMessages,
    mockAuth,
    mockStorage,
    mockUser,
    mockWebConfig,
} from '../mocks';
import { FirebaseUserState } from '../utils/firebase/firebaseUserState';
import { useMockUserConfig } from './useMockUserConfig';
import { useMockRoomMessages } from './useRoomMessages';
import { useMockRoom } from './useMockRoom';
import { State as S, roomTemplate } from '@flocon-trpg/core';
import produce from 'immer';
import { Recipe } from '../utils/types';

type RoomState = S<typeof roomTemplate>;

const roomId = 'dummy-room-id';

export const useSetupMocks = ({
    basicMock: basicMockProp,
    roomConfig: roomConfigProp,
    roomMessagesConfig: roomMessagesConfigProp,
}: {
    basicMock?: {
        auth?: Auth;
        user?: FirebaseUserState;
        storage?: FirebaseStorage;
        webConfig?: Result<WebConfig>;
    };
    roomConfig?: Partial<Parameters<typeof createMockRoom>[0]> & {
        // non-nullishな値を渡す場合はuseCallbackなどを使う
        update?: Recipe<RoomState>;
    };
    roomMessagesConfig?: Partial<Parameters<typeof createMockRoomMessages>[0]> & {
        doNotQuery?: boolean;
    };
} = {}) => {
    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: basicMockProp?.auth ?? { ...mockAuth, currentUser: mockUser },
                storage: basicMockProp?.storage ?? mockStorage,
                user: basicMockProp?.user ?? mockUser,
                webConfig: basicMockProp?.webConfig ?? Result.ok(mockWebConfig),
            },
        });
    }, [
        setStorybook,
        basicMockProp?.auth,
        basicMockProp?.storage,
        basicMockProp?.user,
        basicMockProp?.webConfig,
    ]);

    const room = React.useMemo(() => {
        const result = createMockRoom({
            myParticipantRole: roomConfigProp?.myParticipantRole ?? 'Player',
            setCharacterTagNames: roomConfigProp?.setCharacterTagNames ?? true,
            setPublicChannelNames: roomConfigProp?.setPublicChannelNames ?? true,
            setBoards: roomConfigProp?.setBoards ?? true,
            setCharacters: roomConfigProp?.setCharacters ?? true,
            setParamNames: roomConfigProp?.setParamNames ?? true,
        });
        const update = roomConfigProp?.update;
        if (update == null) {
            return result;
        }
        return produce(result, update);
    }, [
        roomConfigProp?.myParticipantRole,
        roomConfigProp?.setBoards,
        roomConfigProp?.setCharacterTagNames,
        roomConfigProp?.setCharacters,
        roomConfigProp?.setParamNames,
        roomConfigProp?.setPublicChannelNames,
        roomConfigProp?.update,
    ]);
    useMockRoom({ roomId, room });

    useMockUserConfig();
    const { onQuery, setAsNotFetch } = useMockRoomMessages();
    React.useEffect(() => {
        setAsNotFetch();
        if (roomMessagesConfigProp?.doNotQuery === true) {
            return;
        }
        onQuery(
            createMockRoomMessages({
                setGeneralMessages: roomMessagesConfigProp?.setGeneralMessages ?? true,
            })
        );
    }, [
        onQuery,
        setAsNotFetch,
        roomMessagesConfigProp?.setGeneralMessages,
        roomMessagesConfigProp?.doNotQuery,
    ]);
    const setRoomConfig = useSetAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => {
        return defaultRoomConfig(roomId);
    }, []);
    React.useEffect(() => {
        setRoomConfig(roomConfig);
    }, [roomConfig, setRoomConfig]);

    return React.useMemo(() => {
        return {
            roomId,
            roomConfig,
        };
    }, [roomConfig]);
};
