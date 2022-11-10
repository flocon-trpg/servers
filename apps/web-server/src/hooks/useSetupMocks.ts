import { Auth } from '@firebase/auth';
import { FirebaseStorage } from '@firebase/storage';
import { State as S, UpOperation as U, apply, roomTemplate, toOtError } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import produce from 'immer';
import { useSetAtom } from 'jotai';
import React from 'react';
import { useMemoOne } from 'use-memo-one';
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
import { Recipe, SetAction } from '../utils/types';
import { useInitializeTestRoomClient } from './roomClientHooks';
import { useMockUserConfig } from './useMockUserConfig';

type RoomState = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;
const $apply = apply(roomTemplate);

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

    const { isInitialized, source: testRoomClient } = useInitializeTestRoomClient(roomId);

    const room = useMemoOne(() => {
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

    React.useEffect(() => {
        let roomState = room;
        function next() {
            testRoomClient.roomState.next({
                type: 'joined',
                state: room,
                setState,
                setStateByApply,
            });
        }
        function setState(action: SetAction<RoomState>) {
            roomState = typeof action === 'function' ? action(roomState) : action;
            next();
        }
        function setStateByApply(operation: UpOperation) {
            const r = $apply({ state: roomState, operation });
            if (r.isError) {
                throw toOtError(r.error);
            }
            roomState = r.value;
            next();
        }
        next();
    }, [room, testRoomClient.roomState]);

    useMockUserConfig();
    React.useEffect(() => {
        testRoomClient.roomMessageClient.clear();
        if (roomMessagesConfigProp?.doNotQuery === true) {
            return;
        }
        testRoomClient.roomMessageClient.onQuery(
            createMockRoomMessages({
                setGeneralMessages: roomMessagesConfigProp?.setGeneralMessages ?? true,
            })
        );
    }, [
        roomMessagesConfigProp?.setGeneralMessages,
        roomMessagesConfigProp?.doNotQuery,
        testRoomClient.roomMessageClient,
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
            isInitialized,
        };
    }, [isInitialized, roomConfig]);
};
