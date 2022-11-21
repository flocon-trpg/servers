'use strict';

var sdk = require('@flocon-trpg/sdk');
var React = require('react');
var reactUse = require('react-use');
var useMemoOne = require('use-memo-one');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

function useCreateRoomClient(params) {
    const client = params?.client;
    const roomId = params?.roomId;
    const userUid = params?.userUid;
    const [recreateKey, setRecreateKey] = React.useState(0);
    const result = useMemoOne.useMemoOne(() => {
        if (client == null || roomId == null || userUid == null) {
            return null;
        }
        return sdk.createRoomClient({ client, roomId, userUid });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, roomId, userUid, recreateKey]);
    const previousResult = reactUse.usePreviousDistinct(result);
    React.useEffect(() => {
        previousResult?.unsubscribe();
    }, [previousResult]);
    return React.useMemo(() => {
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
    const [state, setState] = React.useState(() => {
        if (source instanceof sdk.ReadonlyBehaviorEvent) {
            return source.getValue();
        }
        return source;
    });
    React.useEffect(() => {
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
    const queryStatus = useReadonlyBehaviorEvent(roomClient.messages.queryStatus);
    const messagesSource = React.useMemo(() => {
        return filter == null
            ? roomClient.messages.messages
            : roomClient.messages.messages.filter(filter);
    }, [filter, roomClient.messages.messages]);
    const [messages, setMessages] = React.useState(() => ({
        current: messagesSource?.getCurrent() ?? [],
    }));
    React.useEffect(() => {
        if (messagesSource == null) {
            return;
        }
        setMessages({ current: messagesSource.getCurrent() });
        const subscription = messagesSource.changed.subscribe({
            next: e => {
                setMessages({
                    current: e.current,
                    diff: e.type === 'event' ? e.diff ?? undefined : undefined,
                });
            },
        });
        return () => subscription.unsubscribe();
    }, [messagesSource]);
    return React__default.default.useMemo(() => ({ messages, queryStatus }), [messages, queryStatus]);
};

const useRoomState = (roomClient) => {
    return useReadonlyBehaviorEvent(roomClient.roomState);
};

const useUpdateWritingMessageStatus = (roomClient) => {
    return React.useMemo(() => {
        return (...params) => roomClient.writingMessageStatus.update(...params);
    }, [roomClient.writingMessageStatus]);
};

const useWritingMessageStatus = (roomClient) => {
    return useReadonlyBehaviorEvent(roomClient.writingMessageStatus.value);
};

exports.useCreateRoomClient = useCreateRoomClient;
exports.useReadonlyBehaviorEvent = useReadonlyBehaviorEvent;
exports.useRoomConnections = useRoomConnections;
exports.useRoomGraphQLStatus = useRoomGraphQLStatus;
exports.useRoomMessages = useRoomMessages;
exports.useRoomState = useRoomState;
exports.useUpdateWritingMessageStatus = useUpdateWritingMessageStatus;
exports.useWritingMessageStatus = useWritingMessageStatus;
//# sourceMappingURL=index.js.map
