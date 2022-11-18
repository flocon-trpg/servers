import { createRoomClient, ReadonlyBehaviorEvent } from '@flocon-trpg/sdk';
import { useState, useEffect, useMemo } from 'react';
import { usePreviousDistinct } from 'react-use';
import { useMemoOne } from 'use-memo-one';

function useCreateRoomClient(params) {
    const client = params?.client;
    const roomId = params?.roomId;
    const userUid = params?.userUid;
    const [recreateKey, setRecreateKey] = useState(0);
    const result = useMemoOne(() => {
        if (client == null || roomId == null || userUid == null) {
            return null;
        }
        return createRoomClient({ client, roomId, userUid });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, roomId, userUid, recreateKey]);
    const previousResult = usePreviousDistinct(result);
    useEffect(() => {
        previousResult?.unsubscribe();
    }, [previousResult]);
    return useMemo(() => {
        if (result == null) {
            return null;
        }
        return {
            value: result,
            recreate: () => {
                setRecreateKey(i => i + 1);
            },
        };
    }, [result]);
}

const useReadonlyBehaviorStream = (source) => {
    const [state, setState] = useState(() => {
        if (source instanceof ReadonlyBehaviorEvent) {
            return source.getValue();
        }
        return source;
    });
    useEffect(() => {
        if (source instanceof ReadonlyBehaviorEvent) {
            setState(source.getValue());
            const subscription = source.subscribe({ next: value => setState(value) });
            return () => subscription.unsubscribe();
        }
        setState(source);
        return undefined;
    }, [source]);
    return state;
};

const useRoomConnections = (roomClient) => {
    return useReadonlyBehaviorStream(roomClient.roomConnections);
};

const useRoomGraphQLStatus = (roomClient) => {
    return useReadonlyBehaviorStream(roomClient.graphQLStatus);
};

const useRoomMessages = (roomClient, filter) => {
    const queryStatus = useReadonlyBehaviorStream(roomClient.messages.queryStatus);
    const messages = useMemo(() => {
        return filter == null
            ? roomClient.messages.messages
            : roomClient.messages.messages.filter(filter);
    }, [filter, roomClient.messages.messages]);
    const [result, setResult] = useState(() => ({
        value: messages?.getCurrent() ?? [],
        queryStatus,
    }));
    useEffect(() => {
        if (messages == null) {
            return;
        }
        const subscription = messages.changed.subscribe({
            next: e => {
                setResult(prevState => ({
                    ...prevState,
                    value: e.current,
                    diff: e.type === 'event' ? e.diff ?? undefined : undefined,
                }));
            },
        });
        return () => subscription.unsubscribe();
    }, [messages]);
    return result;
};

const useRoomState = (roomClient) => {
    return useReadonlyBehaviorStream(roomClient.roomState);
};

const useUpdateWritingMessageStatus = (roomClient) => {
    return useMemo(() => {
        return (...params) => roomClient.writingMessageStatus.update(...params);
    }, [roomClient.writingMessageStatus]);
};

const useWritingMessageStatus = (roomClient) => {
    return useReadonlyBehaviorStream(roomClient.writingMessageStatus.value);
};

export { useCreateRoomClient, useReadonlyBehaviorStream, useRoomConnections, useRoomGraphQLStatus, useRoomMessages, useRoomState, useUpdateWritingMessageStatus, useWritingMessageStatus };
//# sourceMappingURL=index.js.map
