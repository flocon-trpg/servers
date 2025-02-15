import { Auth } from '@firebase/auth';
import { FirebaseStorage } from '@firebase/storage';
import { State as S, roomTemplate } from '@flocon-trpg/core';
import { createTestRoomClient } from '@flocon-trpg/sdk';
import { produce } from 'immer';
import { useSetAtom } from 'jotai';
import React from 'react';
import { CombinedError } from 'urql';
import { useMemoOne } from 'use-memo-one';
import {
    custom,
    roomConfigAtomFamily,
    setMockRoomConfig,
} from '../atoms/roomConfigAtom/roomConfigAtom';
import { defaultRoomConfig } from '../atoms/roomConfigAtom/types/roomConfig';
import { storybookAtom } from '../atoms/storybookAtom/storybookAtom';
import { WebConfig } from '../configType';
import {
    createMockRoom,
    createMockRoomMessages,
    mockAuth,
    mockStorage,
    mockUser,
    mockUserConfig,
    mockWebConfig,
} from '../mocks';
import { FirebaseUserState } from '../utils/firebase/firebaseUserState';
import { Recipe } from '../utils/types';
import { setMockUserConfig } from '@/atoms/userConfigAtom/userConfigAtom';
import { NotificationType } from '@/components/models/room/Room/subcomponents/components/Notification/Notification';
import { RoomClientContextValue } from '@/contexts/RoomClientContext';

type RoomState = S<typeof roomTemplate>;

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
        webConfig?: WebConfig;
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
    React.useEffect(() => {
        setMockRoomConfig(defaultRoomConfig(roomId));
        return () => {
            setMockRoomConfig(null);
        };
    }, []);
    React.useEffect(() => {
        setMockUserConfig(mockUserConfig);
        return () => {
            setMockUserConfig(null);
        };
    }, []);

    const setStorybook = useSetAtom(storybookAtom);
    React.useEffect(() => {
        setStorybook({
            isStorybook: true,
            mock: {
                auth: basicMockProp?.auth ?? {
                    ...mockAuth,
                    currentUser: mockUser,
                    onAuthStateChanged: observer => {
                        const unsubscribe = () => undefined;
                        if (typeof observer === 'function') {
                            observer(mockUser);
                            return unsubscribe;
                        }
                        observer.next(mockUser);
                        return unsubscribe;
                    },
                },
                storage: basicMockProp?.storage ?? mockStorage,
                user: basicMockProp?.user ?? mockUser,
                webConfig: basicMockProp?.webConfig ?? mockWebConfig,
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
        testRoomClient.source.roomState.next({
            type: 'joined',
            state: room,
        });
    }, [testRoomClient.source.roomState, room]);

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
    const roomConfigAtom = roomConfigAtomFamily(roomId);
    const reduceRoomConfig = useSetAtom(roomConfigAtom);
    const roomConfig = React.useMemo(() => {
        return defaultRoomConfig(roomId);
    }, []);
    React.useEffect(() => {
        reduceRoomConfig({ type: custom, action: () => roomConfig });
    }, [roomConfig, reduceRoomConfig]);

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
