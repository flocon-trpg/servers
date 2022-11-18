'use strict';

var sdk = require('@flocon-trpg/sdk');
var react = require('react');
var reactUse = require('react-use');
var useMemoOne = require('use-memo-one');

function useCreateRoomClient(params) {
    const client = params?.client;
    const roomId = params?.roomId;
    const userUid = params?.userUid;
    const [recreateKey, setRecreateKey] = react.useState(0);
    const result = useMemoOne.useMemoOne(() => {
        if (client == null || roomId == null || userUid == null) {
            return null;
        }
        return sdk.createRoomClient({ client, roomId, userUid });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, roomId, userUid, recreateKey]);
    const previousResult = reactUse.usePreviousDistinct(result);
    react.useEffect(() => {
        previousResult?.unsubscribe();
    }, [previousResult]);
    return react.useMemo(() => {
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
    const [state, setState] = react.useState(() => {
        if (source instanceof sdk.ReadonlyBehaviorEvent) {
            return source.getValue();
        }
        return source;
    });
    react.useEffect(() => {
        if (source instanceof sdk.ReadonlyBehaviorEvent) {
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
    const messages = react.useMemo(() => {
        return filter == null
            ? roomClient.messages.messages
            : roomClient.messages.messages.filter(filter);
    }, [filter, roomClient.messages.messages]);
    const [result, setResult] = react.useState(() => ({
        value: messages?.getCurrent() ?? [],
        queryStatus,
    }));
    react.useEffect(() => {
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
    return react.useMemo(() => {
        return (...params) => roomClient.writingMessageStatus.update(...params);
    }, [roomClient.writingMessageStatus]);
};

const useWritingMessageStatus = (roomClient) => {
    return useReadonlyBehaviorStream(roomClient.writingMessageStatus.value);
};

exports.useCreateRoomClient = useCreateRoomClient;
exports.useReadonlyBehaviorStream = useReadonlyBehaviorStream;
exports.useRoomConnections = useRoomConnections;
exports.useRoomGraphQLStatus = useRoomGraphQLStatus;
exports.useRoomMessages = useRoomMessages;
exports.useRoomState = useRoomState;
exports.useUpdateWritingMessageStatus = useUpdateWritingMessageStatus;
exports.useWritingMessageStatus = useWritingMessageStatus;
//# sourceMappingURL=index.js.map
