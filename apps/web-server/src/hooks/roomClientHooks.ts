import { RoomClient, createTestRoomClient } from '@flocon-trpg/sdk';
import { useCreateRoomClient } from '@flocon-trpg/sdk-react';
import { createGraphQLClientForRoomClient } from '@flocon-trpg/sdk-urql';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useLatest, usePreviousDistinct } from 'react-use';
import { CombinedError, useClient } from 'urql';
import { useMemoOne } from 'use-memo-one';
import { NotificationType } from '../components/models/room/Room/subcomponents/components/Notification/Notification';
import { useGetIdToken } from './useGetIdToken';
import { useMyUserUid } from './useMyUserUid';

type RoomClientAtomValue = {
    value: RoomClient<NotificationType<CombinedError>, CombinedError>;
    recreate: () => void;
    isMock: boolean;
    roomId: string;
};

const roomClientAtom = atom<RoomClientAtomValue | null>(null);

export const useRoomClient = () => {
    const result = useAtomValue(roomClientAtom);
    if (result == null) {
        throw new Error('RoomClient is not initialized.');
    }
    return result;
};

export const useTryRoomClient = () => {
    return useAtomValue(roomClientAtom);
};

export const useInitializeRoomClient = ({ roomId }: { roomId: string }) => {
    const urqlClient = useClient();
    const userUid = useMyUserUid();
    const { canGetIdToken } = useGetIdToken();
    const setRoomClient = useSetAtom(roomClientAtom);
    const setRoomClientRef = useLatest(setRoomClient);
    const client = useMemoOne(() => {
        return createGraphQLClientForRoomClient(urqlClient);
    }, [urqlClient]);
    // canGetIdToken === false のときは失敗することが確定しているので RoomClient を作成しないようにしている
    const roomClientResult = useCreateRoomClient<NotificationType<CombinedError>, CombinedError>(
        !canGetIdToken || userUid == null ? null : { client, roomId, userUid }
    );
    React.useEffect(() => {
        setRoomClientRef.current(
            roomClientResult == null ? null : { ...roomClientResult, isMock: false, roomId }
        );
    }, [roomClientResult, roomId, setRoomClientRef]);
};

/** TestRoomClient を作成し、atom にセットします。Storybookやテストなどでのみ実行してください。 */
export const useInitializeTestRoomClient = (roomId: string) => {
    const [roomClient, setRoomClient] = useAtom(roomClientAtom);
    const prevRoomClient = usePreviousDistinct(roomClient);
    React.useEffect(() => {
        if (roomClient != null && prevRoomClient != null) {
            console.warn(
                'TestRoomClient が複数回作成されました。TestRoomClient のデータはリセットされます。'
            );
        }
    }, [prevRoomClient, roomClient]);
    const setRoomClientRef = useLatest(setRoomClient);
    const mockClient = useMemoOne(
        () => createTestRoomClient<NotificationType<CombinedError>, CombinedError>({}),
        []
    );
    React.useEffect(() => {
        setRoomClientRef.current({
            value: mockClient.roomClient,
            recreate: () => undefined,
            isMock: true,
            roomId,
        });
    }, [mockClient.roomClient, roomId, setRoomClientRef]);
    const isInitialized = roomClient != null;
    return useMemoOne(() => {
        return { isInitialized, source: mockClient.source };
    }, [isInitialized, mockClient.source]);
};
