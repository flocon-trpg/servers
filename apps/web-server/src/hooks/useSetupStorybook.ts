import { Auth } from '@firebase/auth';
import { FirebaseStorage } from '@firebase/storage';
import { State as S, UpOperation as U, apply, roomTemplate, toOtError } from '@flocon-trpg/core';
import { createTestRoomClient } from '@flocon-trpg/sdk';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
import { useSetAtom } from 'jotai';
import React from 'react';
import { CombinedError } from 'urql';
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
import { useMockUserConfig } from './useMockUserConfig';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';
import { RoomClientContextValue } from '@/contexts/RoomClientContext';

type RoomState = S<typeof roomTemplate>;
type UpOperation = U<typeof roomTemplate>;
const $apply = apply(roomTemplate);

const roomId = 'dummy-room-id';

export const useSetupStorybook = ({
    basicMock: basicMockProp,
    room: roomProp,
    roomMessagesConfig: roomMessagesConfigProp,
}: {
    basicMock?: {
        auth?: Auth;
        user?: FirebaseUserState;
        storage?: FirebaseStorage;
        webConfig?: Result<WebConfig>;
    };
    // custom が nullish ならば、Partial<Parameters<typeof createMockRoom>[0]> の値から createMockRoom を実行して RoomState が作成される。update はどちらの場合でも用いられる。
    room?: Partial<Parameters<typeof createMockRoom>[0]> & {
        custom?: RoomState;

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

    const testRoomClient = useMemoOne(
        () => createTestRoomClient<NotificationType<CombinedError>, CombinedError>({}),
        [],
    );

    const room = useMemoOne(() => {
        const result =
            roomProp?.custom ??
            createMockRoom({
                myParticipantRole: roomProp?.myParticipantRole ?? 'Player',
                setCharacterTagNames: roomProp?.setCharacterTagNames ?? true,
                setPublicChannelNames: roomProp?.setPublicChannelNames ?? true,
                setBoards: roomProp?.setBoards ?? true,
                setCharacters: roomProp?.setCharacters ?? true,
                setParamNames: roomProp?.setParamNames ?? true,
            });
        const update = roomProp?.update;
        if (update == null) {
            return result;
        }
        return produce(result, update);
    }, [
        roomProp?.custom,
        roomProp?.myParticipantRole,
        roomProp?.setBoards,
        roomProp?.setCharacterTagNames,
        roomProp?.setCharacters,
        roomProp?.setParamNames,
        roomProp?.setPublicChannelNames,
        roomProp?.update,
    ]);

    React.useEffect(() => {
        let roomState = room;
        function next() {
            testRoomClient.source.roomState.next({
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
    }, [testRoomClient.source.roomState, room]);

    useMockUserConfig();
    React.useEffect(() => {
        testRoomClient.source.roomMessageClient.clear();
        if (roomMessagesConfigProp?.doNotQuery === true) {
            return;
        }
        testRoomClient.source.roomMessageClient.onQuery(
            createMockRoomMessages({
                setGeneralMessages: roomMessagesConfigProp?.setGeneralMessages ?? true,
            }),
        );
    }, [
        roomMessagesConfigProp?.setGeneralMessages,
        roomMessagesConfigProp?.doNotQuery,
        testRoomClient.source.roomMessageClient,
    ]);
    const setRoomConfig = useSetAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => {
        return defaultRoomConfig(roomId);
    }, []);
    React.useEffect(() => {
        setRoomConfig(roomConfig);
    }, [roomConfig, setRoomConfig]);

    return React.useMemo(() => {
        const roomClientContextValue: RoomClientContextValue = {
            value: testRoomClient.roomClient,
            recreate: () => {
                throw new Error('recreate is not implemented.');
            },
            roomId,
            isMock: true,
        };
        return {
            roomId,
            roomConfig,
            roomClientContextValue,
        };
    }, [testRoomClient, roomConfig]);
};
