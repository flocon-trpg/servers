import { createRoomClient, ReadonlyBehaviorEvent } from '@flocon-trpg/sdk';
import { useState, useEffect, useMemo } from 'react';

function useCreateRoomClient(params) {
    const client = params?.client;
    const roomId = params?.roomId;
    const userUid = params?.userUid;
    const [recreateKey, setRecreateKey] = useState(0);
    const [result, setResult] = useState();
    useEffect(() => {
        if (client == null || roomId == null || userUid == null) {
            return;
        }
        const next = createRoomClient({ client, roomId, userUid });
        setResult(prev => {
            if (prev != null) {
                prev.unsubscribe();
            }
            return next;
        });
    }, [client, roomId, userUid, recreateKey]);
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

const useReadonlyBehaviorEvent = (source) => {
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
    return useReadonlyBehaviorEvent(roomClient.roomConnections);
};

const useRoomGraphQLStatus = (roomClient) => {
    return useReadonlyBehaviorEvent(roomClient.graphQLStatus);
};

/**
 * 部屋に投稿されたメッセージ(秘話およびログも含む)およびカスタムメッセージのリストと変更点を返します。
 *
 * @param filter function が渡された場合、true を返すメッセージのみを抽出します。変更されるたびに全てのメッセージの抽出処理が行われるため、function を渡す場合は useCallback などを用いる必要があります。
 */
const useRoomMessages = (roomClient, filter) => {
    const messagesSource = useMemo(() => {
        return filter == null
            ? roomClient.messages.messages
            : roomClient.messages.messages.filter(filter);
    }, [filter, roomClient.messages.messages]);
    const [result, setResult] = useState(() => ({
        current: messagesSource?.getCurrent() ?? [],
    }));
    useEffect(() => {
        if (messagesSource == null) {
            return;
        }
        setResult({ current: messagesSource.getCurrent() });
        const subscription = messagesSource.changed.subscribe({
            next: e => {
                setResult({
                    current: e.current,
                    diff: e.type === 'event' ? e.diff ?? undefined : undefined,
                });
            },
        });
        return () => subscription.unsubscribe();
    }, [messagesSource]);
    return result;
};

const useRoomMessageQueryStatus = (roomClient) => {
    return useReadonlyBehaviorEvent(roomClient.messages.queryStatus);
};

const useRoomState = (roomClient) => {
    return useReadonlyBehaviorEvent(roomClient.roomState);
};

const useUpdateWritingMessageStatus = (roomClient) => {
    return useMemo(() => {
        return (...params) => roomClient.writingMessageStatus.update(...params);
    }, [roomClient.writingMessageStatus]);
};

const useWritingMessageStatus = (roomClient) => {
    return useReadonlyBehaviorEvent(roomClient.writingMessageStatus.value);
};

export { useCreateRoomClient, useReadonlyBehaviorEvent, useRoomConnections, useRoomGraphQLStatus, useRoomMessageQueryStatus, useRoomMessages, useRoomState, useUpdateWritingMessageStatus, useWritingMessageStatus };
//# sourceMappingURL=index.js.map
